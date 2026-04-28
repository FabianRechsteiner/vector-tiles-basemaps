import type {
  ControlPosition,
  IControl,
  Map as MapLibreMap,
} from "maplibre-gl";
import { defaultBasemapRegistry, getBasemap, getBasemapPreviewCandidates, listBasemaps } from "./registry.js";
import { applyBasemap } from "./styles.js";
import type {
  BasemapControlOptions,
  BasemapDefinition,
  BasemapErrorEvent,
  BasemapRegistry,
} from "./types.js";

const variantBackgrounds: Record<string, string> = {
  light: "linear-gradient(135deg, #f8fafc 0%, #d6dde6 100%)",
  dark: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  relief: "linear-gradient(135deg, #e7d7b8 0%, #b4915f 100%)",
  imagery: "linear-gradient(135deg, #315f2e 0%, #94a93e 100%)",
  colorful: "linear-gradient(135deg, #71c7ec 0%, #f7c948 45%, #7cc36b 100%)",
  gray: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
  white: "linear-gradient(135deg, #ffffff 0%, #dfe7ef 100%)",
  black: "linear-gradient(135deg, #111827 0%, #000000 100%)",
};

let nextControlId = 0;

function shortLabel(label: string): string {
  return label
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function createPreviewElement(documentRef: Document, definition: BasemapDefinition): HTMLElement {
  const preview = documentRef.createElement("span");
  preview.className = "vtb-thumb";

  const candidates = getBasemapPreviewCandidates(definition);
  const image = documentRef.createElement("img");
  image.className = "vtb-thumb-image";
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";

  let index = 0;

  const activateFallback = () => {
    preview.replaceChildren();
    preview.classList.add("vtb-thumb--fallback");
    preview.dataset.shortLabel = shortLabel(definition.name);
    preview.style.background = variantBackgrounds[definition.variant] ?? variantBackgrounds.light ?? "#ffffff";
  };

  if (!candidates.length) {
    activateFallback();
    return preview;
  }

  image.addEventListener("error", () => {
    index += 1;

    if (index < candidates.length) {
      image.src = candidates[index] ?? "";
      return;
    }

    activateFallback();
  });

  image.src = candidates[index] ?? "";
  preview.appendChild(image);

  return preview;
}

function labelForGroup(value: string, registry: BasemapRegistry, groupBy: NonNullable<BasemapControlOptions["groupBy"]>): string {
  if (groupBy === "provider") {
    return registry.getProvider(value)?.name ?? value;
  }

  if (groupBy === "group") {
    return registry.getGroup(value)?.label ?? value;
  }

  return value;
}

function ownerDocumentFor(map: MapLibreMap): Document {
  return map.getContainer().ownerDocument;
}

function composeAbortSignal(
  signal: AbortSignal,
  externalSignal: AbortSignal | undefined,
): { signal: AbortSignal; cleanup: () => void } {
  if (!externalSignal) {
    return { signal, cleanup: () => undefined };
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  const abortFromExternal = () => controller.abort();

  if (signal.aborted || externalSignal.aborted) {
    controller.abort();
  } else {
    signal.addEventListener("abort", abort, { once: true });
    externalSignal.addEventListener("abort", abortFromExternal, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      signal.removeEventListener("abort", abort);
      externalSignal.removeEventListener("abort", abortFromExternal);
    },
  };
}

export class BasemapControl<TSnapshot = unknown> implements IControl {
  private readonly options: BasemapControlOptions<TSnapshot>;
  private readonly id = ++nextControlId;
  private map: MapLibreMap | null = null;
  private documentRef: Document | null = null;
  private container: HTMLElement | null = null;
  private activeButton: HTMLButtonElement | null = null;
  private panel: HTMLElement | null = null;
  private readonly buttons = new Map<string, HTMLButtonElement>();
  private buttonOrder: HTMLButtonElement[] = [];
  private items: BasemapDefinition[] = [];
  private activeBasemapId: string | null;
  private previewBasemapId: string | null = null;
  private focusIndex = 0;
  private isOpen = false;
  private applySequence = 0;
  private applyAbortController: AbortController | null = null;
  private documentPointerHandler: ((event: PointerEvent) => void) | null = null;
  private documentKeydownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(options: BasemapControlOptions<TSnapshot> = {}) {
    this.options = options;
    this.activeBasemapId = options.initialBasemapId ?? null;
  }

  getDefaultPosition(): ControlPosition {
    return this.options.position ?? this.options.defaultPosition ?? "top-right";
  }

  onAdd(map: MapLibreMap): HTMLElement {
    this.map = map;
    this.documentRef = ownerDocumentFor(map);
    const documentRef = this.documentRef;
    const registry = this.options.registry;

    this.items = this.options.basemapIds
      ? listBasemaps({ ids: this.options.basemapIds }, registry)
      : listBasemaps(this.options.filters ?? {}, registry);

    if (!this.activeBasemapId && this.items.length) {
      this.activeBasemapId = this.items[0]?.id ?? null;
    }
    this.activeBasemapId = this.normalizeActiveBasemapId(this.activeBasemapId);

    this.container = documentRef.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group vtb-basemap-control";
    this.container.dataset.open = "false";

    this.activeButton = documentRef.createElement("button");
    this.activeButton.type = "button";
    this.activeButton.className = "vtb-toggle";
    this.activeButton.setAttribute("aria-expanded", "false");
    this.activeButton.setAttribute("aria-controls", `vtb-panel-${this.id}`);
    this.activeButton.setAttribute("aria-label", this.options.label ?? "Choose basemap");
    this.activeButton.addEventListener("click", () => this.togglePanel());
    this.container.appendChild(this.activeButton);

    this.panel = documentRef.createElement("div");
    this.panel.id = `vtb-panel-${this.id}`;
    this.panel.className = "vtb-panel";
    this.panel.hidden = true;
    this.panel.setAttribute("role", "radiogroup");
    this.panel.setAttribute("aria-label", this.options.label ?? "Basemaps");
    this.panel.addEventListener("keydown", (event) => this.handlePanelKeydown(event));
    this.panel.addEventListener("pointerleave", () => this.restoreActiveBasemapPreview());
    this.container.appendChild(this.panel);

    this.documentPointerHandler = (event) => {
      const NodeCtor = documentRef.defaultView?.Node;
      if (
        this.isOpen &&
        this.container &&
        NodeCtor &&
        event.target instanceof NodeCtor &&
        !this.container.contains(event.target)
      ) {
        this.setPanelOpen(false);
      }
    };

    this.documentKeydownHandler = (event) => {
      if (event.key === "Escape" && this.isOpen) {
        this.setPanelOpen(false);
        this.activeButton?.focus();
      }
    };

    documentRef.addEventListener("pointerdown", this.documentPointerHandler);
    documentRef.addEventListener("keydown", this.documentKeydownHandler);

    this.render();
    return this.container;
  }

  onRemove(): void {
    this.abortPendingApply();

    if (this.documentRef && this.documentPointerHandler) {
      this.documentRef.removeEventListener("pointerdown", this.documentPointerHandler);
    }

    if (this.documentRef && this.documentKeydownHandler) {
      this.documentRef.removeEventListener("keydown", this.documentKeydownHandler);
    }

    this.container?.remove();
    this.buttons.clear();
    this.buttonOrder = [];
    this.items = [];
    this.map = null;
    this.documentRef = null;
    this.container = null;
    this.panel = null;
    this.activeButton = null;
    this.documentPointerHandler = null;
    this.documentKeydownHandler = null;
    this.isOpen = false;
    this.previewBasemapId = null;
    this.applySequence = 0;
  }

  setActiveBasemap(id: string): void {
    this.activeBasemapId = this.normalizeActiveBasemapId(id);
    this.previewBasemapId = null;
    this.render();
  }

  private abortPendingApply(): void {
    this.applyAbortController?.abort();
    this.applyAbortController = null;
  }

  private hasBasemap(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }

  private normalizeActiveBasemapId(id: string | null): string | null {
    if (!this.items.length) {
      return id;
    }

    if (id && this.hasBasemap(id)) {
      return id;
    }

    return this.items[0]?.id ?? null;
  }

  private render(): void {
    this.renderActiveButton();
    this.renderPanel();
  }

  private renderActiveButton(): void {
    if (!this.documentRef || !this.activeButton) {
      return;
    }

    const visibleBasemapId = this.previewBasemapId ?? this.activeBasemapId;
    const activeDefinition = this.items.find((item) => item.id === visibleBasemapId) ?? this.items[0];

    this.activeButton.replaceChildren();

    if (!activeDefinition) {
      this.activeButton.textContent = "Basemaps";
      return;
    }

    this.activeButton.title = activeDefinition.name;

    const activeTile = this.documentRef.createElement("span");
    activeTile.className = "vtb-active-tile";
    activeTile.appendChild(createPreviewElement(this.documentRef, activeDefinition));
    this.activeButton.appendChild(activeTile);

    const meta = this.documentRef.createElement("span");
    meta.className = "vtb-toggle-meta";

    const name = this.documentRef.createElement("span");
    name.className = "vtb-toggle-name";
    name.textContent = activeDefinition.name;
    meta.appendChild(name);

    const group = this.documentRef.createElement("span");
    group.className = "vtb-toggle-group";
    group.textContent = labelForGroup(
      activeDefinition[this.options.groupBy ?? "variant"],
      this.options.registry ?? defaultBasemapRegistry,
      this.options.groupBy ?? "variant",
    );
    meta.appendChild(group);

    this.activeButton.appendChild(meta);

    const caret = this.documentRef.createElement("span");
    caret.className = "vtb-toggle-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▾";
    this.activeButton.appendChild(caret);
  }

  private renderPanel(): void {
    if (!this.documentRef || !this.panel) {
      return;
    }

    const registry = this.options.registry ?? defaultBasemapRegistry;

    this.panel.replaceChildren();
    this.buttons.clear();
    this.buttonOrder = [];

    const groupBy = this.options.groupBy ?? "variant";
    const grouped = new Map<string, BasemapDefinition[]>();

    for (const definition of this.items) {
      const key = definition[groupBy];
      const group = grouped.get(key) ?? [];
      group.push(definition);
      grouped.set(key, group);
    }

    for (const [groupKey, definitions] of grouped.entries()) {
      const section = this.documentRef.createElement("section");
      section.className = "vtb-group";

      const title = this.documentRef.createElement("div");
      title.className = "vtb-group-title";
      title.textContent = labelForGroup(groupKey, registry, groupBy);
      section.appendChild(title);

      const grid = this.documentRef.createElement("div");
      grid.className = "vtb-grid";

      for (const definition of definitions) {
        const button = this.documentRef.createElement("button");
        const isSelected = definition.id === this.activeBasemapId;
        const isPreviewed = definition.id === this.previewBasemapId;

        button.type = "button";
        button.className = "vtb-button";
        button.title = definition.name;
        button.setAttribute("role", "radio");
        button.setAttribute("aria-label", `${definition.name}, ${definition.sourceType} basemap`);
        button.setAttribute("aria-checked", String(isSelected));
        button.tabIndex = this.buttonOrder.length === this.focusIndex ? 0 : -1;
        button.dataset.selected = String(isSelected);
        button.dataset.previewed = String(isPreviewed);
        button.appendChild(createPreviewElement(this.documentRef, definition));

        button.addEventListener("pointerenter", () => {
          this.previewBasemap(definition.id);
        });

        button.addEventListener("focus", () => {
          this.previewBasemap(definition.id, { restoreFocus: true });
        });

        button.addEventListener("click", () => {
          void this.applyBasemapId(definition.id, { commit: true });
        });

        this.buttons.set(definition.id, button);
        this.buttonOrder.push(button);
        grid.appendChild(button);
      }

      section.appendChild(grid);
      this.panel.appendChild(section);
    }

    this.syncRovingFocus();
  }

  private syncRovingFocus(): void {
    if (!this.buttonOrder.length) {
      this.focusIndex = 0;
      return;
    }

    const activeIndex = this.buttonOrder.findIndex((button) => button.dataset.selected === "true");
    if (activeIndex >= 0 && !this.isOpen) {
      this.focusIndex = activeIndex;
    }

    this.focusIndex = Math.max(0, Math.min(this.focusIndex, this.buttonOrder.length - 1));

    this.buttonOrder.forEach((button, index) => {
      button.tabIndex = index === this.focusIndex ? 0 : -1;
    });
  }

  private focusButton(index: number): void {
    if (!this.buttonOrder.length) {
      return;
    }

    this.focusIndex = (index + this.buttonOrder.length) % this.buttonOrder.length;
    this.syncRovingFocus();
    this.buttonOrder[this.focusIndex]?.focus();
  }

  private handlePanelKeydown(event: KeyboardEvent): void {
    if (!this.buttonOrder.length) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      this.focusButton(this.focusIndex + 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      this.focusButton(this.focusIndex - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.focusButton(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      this.focusButton(this.buttonOrder.length - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.setPanelOpen(false);
      this.activeButton?.focus();
    }
  }

  private setButtonsDisabled(disabled: boolean): void {
    this.buttons.forEach((button) => {
      button.disabled = disabled;
    });
    if (this.activeButton) {
      this.activeButton.disabled = disabled;
    }
  }

  private async applyBasemapId(
    id: string,
    options: {
      commit?: boolean;
      restoreFocus?: boolean;
    } = {},
  ): Promise<void> {
    if (!this.map) {
      return;
    }

    if (!this.hasBasemap(id)) {
      this.activeBasemapId = this.normalizeActiveBasemapId(this.activeBasemapId);
      this.previewBasemapId = null;
      this.render();
      return;
    }

    const { commit = false, restoreFocus = false } = options;
    this.abortPendingApply();
    const applyAbortController = new AbortController();
    this.applyAbortController = applyAbortController;
    const abortSignal = composeAbortSignal(
      applyAbortController.signal,
      this.options.applyOptions?.signal,
    );
    const sequence = ++this.applySequence;
    const previousBasemapId = commit
      ? this.activeBasemapId ?? undefined
      : this.previewBasemapId ?? this.activeBasemapId ?? undefined;
    const previousBasemap = previousBasemapId
      ? getBasemap(previousBasemapId, this.options.registry)
      : null;
    const onBasemapError = (event: BasemapErrorEvent) => {
      this.options.applyOptions?.onBasemapError?.(event);
      this.options.onBasemapError?.(event);
    };

    if (commit) {
      this.setButtonsDisabled(true);
    }

    try {
      const result = await applyBasemap(this.map, id, {
        ...this.options.applyOptions,
        registry: this.options.registry ?? this.options.applyOptions?.registry,
        previousBasemapId,
        signal: abortSignal.signal,
        onBasemapError,
      });

      if (sequence !== this.applySequence) {
        return;
      }

      if (commit) {
        this.previewBasemapId = null;
        this.activeBasemapId = id;
        this.options.onBasemapChange?.({
          map: this.map,
          basemap: result.basemap,
          previousBasemap,
          style: result.style,
        });
        this.options.onChange?.(result.basemap);
        this.setPanelOpen(false, { restorePreview: false });
      } else {
        this.previewBasemapId = id;
        this.options.onPreview?.(result.basemap);
      }

      this.render();

      if (restoreFocus && this.isOpen) {
        const schedule = this.documentRef?.defaultView?.requestAnimationFrame ?? ((callback: FrameRequestCallback) => {
          return globalThis.setTimeout(() => callback(0), 0);
        });
        schedule(() => {
          this.buttons.get(id)?.focus();
        });
      }
    } catch {
      // Errors are surfaced through onBasemapError by applyBasemap; aborted previews are intentionally silent.
    } finally {
      abortSignal.cleanup();
      if (this.applyAbortController === applyAbortController) {
        this.applyAbortController = null;
      }

      if (commit && sequence === this.applySequence) {
        this.setButtonsDisabled(false);
      }
    }
  }

  private previewBasemap(id: string, options: { restoreFocus?: boolean } = {}): void {
    if (!this.isOpen) {
      return;
    }

    if (id === this.previewBasemapId) {
      return;
    }

    if (id === this.activeBasemapId && this.previewBasemapId == null) {
      return;
    }

    void this.applyBasemapId(id, { restoreFocus: options.restoreFocus });
  }

  private restoreActiveBasemapPreview(): void {
    if (!this.activeBasemapId) {
      this.previewBasemapId = null;
      this.options.onPreview?.(null);
      this.render();
      return;
    }

    if (!this.previewBasemapId || this.previewBasemapId === this.activeBasemapId) {
      this.previewBasemapId = null;
      this.options.onPreview?.(getBasemap(this.activeBasemapId, this.options.registry));
      this.render();
      return;
    }

    const activeBasemapId = this.activeBasemapId;
    this.previewBasemapId = null;
    this.options.onPreview?.(getBasemap(activeBasemapId, this.options.registry));
    void this.applyBasemapId(activeBasemapId);
  }

  private togglePanel(): void {
    this.setPanelOpen(!this.isOpen);
  }

  private setPanelOpen(open: boolean, options: { restorePreview?: boolean } = {}): void {
    if (!open && options.restorePreview !== false) {
      this.restoreActiveBasemapPreview();
    }

    this.isOpen = open;

    if (!this.container || !this.panel || !this.activeButton) {
      return;
    }

    this.container.dataset.open = String(open);
    this.panel.hidden = !open;
    this.activeButton.setAttribute("aria-expanded", String(open));

    if (open) {
      this.syncRovingFocus();
      const schedule = this.documentRef?.defaultView?.requestAnimationFrame ?? ((callback: FrameRequestCallback) => {
        return globalThis.setTimeout(() => callback(0), 0);
      });
      schedule(() => {
        if (this.isOpen && !this.previewBasemapId) {
          this.buttonOrder[this.focusIndex]?.focus();
        }
      });
    }
  }
}

export function createBasemapControl<TSnapshot = unknown>(
  options: BasemapControlOptions<TSnapshot> = {},
): BasemapControl<TSnapshot> {
  return new BasemapControl(options);
}
