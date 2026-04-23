import { applyBasemap } from "./styles.js";
import { getBasemap, getBasemapPreviewCandidates, listBasemaps } from "./basemaps.js";

const CONTROL_STYLE_ID = "vector-tiles-basemaps-control-style";

const variantBackgrounds = {
  light: "linear-gradient(135deg, #f8fafc 0%, #d6dde6 100%)",
  dark: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
  relief: "linear-gradient(135deg, #e7d7b8 0%, #b4915f 100%)",
  imagery: "linear-gradient(135deg, #315f2e 0%, #94a93e 100%)",
  colorful: "linear-gradient(135deg, #71c7ec 0%, #f7c948 45%, #7cc36b 100%)",
  gray: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
  white: "linear-gradient(135deg, #ffffff 0%, #dfe7ef 100%)",
  black: "linear-gradient(135deg, #111827 0%, #000000 100%)",
};

function ensureControlStyles() {
  if (typeof document === "undefined" || document.getElementById(CONTROL_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = CONTROL_STYLE_ID;
  style.textContent = `
    .vtb-control {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(148, 163, 184, 0.45);
      border-radius: 18px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
      min-width: 86px;
      padding: 10px;
      backdrop-filter: blur(12px);
      font: 12px/1.2 "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      position: relative;
    }

    .vtb-toggle {
      appearance: none;
      background: none;
      border: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      width: 100%;
    }

    .vtb-toggle:focus-visible {
      outline: 2px solid #0f766e;
      outline-offset: 3px;
      border-radius: 16px;
    }

    .vtb-active-tile {
      border: 2px solid rgba(15, 118, 110, 0.88);
      border-radius: 16px;
      box-shadow: 0 10px 22px rgba(15, 118, 110, 0.18);
      flex: 0 0 auto;
      height: 60px;
      overflow: hidden;
      position: relative;
      width: 60px;
    }

    .vtb-toggle-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      text-align: left;
    }

    .vtb-toggle-name {
      color: #0f172a;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vtb-toggle-group {
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .vtb-toggle-caret {
      color: #0f766e;
      flex: 0 0 auto;
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
      margin-left: auto;
      transition: transform 140ms ease;
    }

    .vtb-control[data-open="true"] .vtb-toggle-caret {
      transform: rotate(180deg);
    }

    .vtb-panel {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 18px;
      bottom: 100%;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
      display: grid;
      gap: 12px;
      left: 0;
      margin-bottom: 10px;
      max-height: min(60vh, 420px);
      min-width: 180px;
      overflow: auto;
      padding: 12px;
      position: absolute;
      width: max-content;
    }

    .vtb-panel[hidden] {
      display: none;
    }

    .vtb-group {
      display: grid;
      gap: 8px;
    }

    .vtb-group-title {
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .vtb-grid {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(2, 64px);
    }

    .vtb-button {
      appearance: none;
      background: #fff;
      border: 2px solid transparent;
      border-radius: 16px;
      cursor: pointer;
      display: block;
      height: 64px;
      overflow: hidden;
      padding: 0;
      position: relative;
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
      width: 64px;
    }

    .vtb-button:hover,
    .vtb-button:focus-visible {
      border-color: #0f766e;
      box-shadow: 0 8px 18px rgba(15, 118, 110, 0.2);
      outline: none;
      transform: translateY(-1px);
    }

    .vtb-button[aria-pressed="true"] {
      border-color: #0f766e;
      box-shadow: 0 0 0 1px rgba(15, 118, 110, 0.4);
    }

    .vtb-button[data-selected="true"] {
      border-color: rgba(15, 118, 110, 0.88);
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.22);
    }

    .vtb-thumb {
      display: block;
      height: 100%;
      inset: 0;
      position: absolute;
      width: 100%;
    }

    .vtb-thumb-image {
      display: block;
      height: 100%;
      background-position: center;
      background-size: cover;
      object-fit: cover;
      width: 100%;
    }

    .vtb-thumb--fallback::after {
      content: attr(data-short-label);
      align-items: center;
      color: rgba(15, 23, 42, 0.8);
      display: flex;
      font-size: 12px;
      font-weight: 700;
      height: 100%;
      justify-content: center;
      letter-spacing: 0.04em;
      width: 100%;
    }

    .vtb-empty {
      color: #64748b;
      font-size: 11px;
      font-style: italic;
      padding: 4px 2px 2px;
    }
  `;

  document.head.appendChild(style);
}

function shortLabel(label) {
  return label
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function createPreviewElement(definition) {
  const preview = document.createElement("span");
  preview.className = "vtb-thumb";

  const candidates = getBasemapPreviewCandidates(definition);
  const image = document.createElement("img");
  image.className = "vtb-thumb-image";
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";

  let index = 0;

  const activateFallback = () => {
    preview.replaceChildren();
    preview.classList.add("vtb-thumb--fallback");
    preview.dataset.shortLabel = shortLabel(definition.name);
    preview.style.background = variantBackgrounds[definition.variant] ?? variantBackgrounds.light;
  };

  if (!candidates.length) {
    activateFallback();
    return preview;
  }

  image.addEventListener("error", () => {
    index += 1;

    if (index < candidates.length) {
      image.src = candidates[index];
      return;
    }

    activateFallback();
  });

  image.src = candidates[index];
  preview.appendChild(image);

  return preview;
}

function groupLabel(value, groupBy) {
  if (groupBy === "provider") {
    return value;
  }

  return value;
}

export class BasemapControl {
  constructor(options = {}) {
    this.options = options;
    this.map = null;
    this.container = null;
    this.buttons = new Map();
    this.activeBasemapId = options.initialBasemapId ?? null;
    this.items = [];
    this.panel = null;
    this.activeButton = null;
    this.documentPointerHandler = null;
    this.keydownHandler = null;
    this.isOpen = false;
    this.previewBasemapId = null;
    this.applySequence = 0;
  }

  onAdd(map) {
    ensureControlStyles();

    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl vtb-control";
    this.container.dataset.open = "false";

    this.items = this.options.basemapIds
      ? listBasemaps({ ids: this.options.basemapIds })
      : listBasemaps(this.options.filters ?? {});

    if (!this.activeBasemapId && this.items.length) {
      this.activeBasemapId = this.items[0].id;
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "vtb-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open basemap selector");
    toggle.addEventListener("click", () => {
      this.togglePanel();
    });

    this.activeButton = toggle;
    this.container.appendChild(toggle);

    const panel = document.createElement("div");
    panel.className = "vtb-panel";
    panel.hidden = true;
    panel.addEventListener("pointerleave", () => {
      this.restoreActiveBasemapPreview();
    });
    this.panel = panel;
    this.container.appendChild(panel);

    this.documentPointerHandler = (event) => {
      if (this.isOpen && this.container && !this.container.contains(event.target)) {
        this.restoreActiveBasemapPreview();
        this.setPanelOpen(false);
      }
    };

    this.keydownHandler = (event) => {
      if (event.key === "Escape") {
        this.restoreActiveBasemapPreview();
        this.setPanelOpen(false);
      }
    };

    document.addEventListener("pointerdown", this.documentPointerHandler);
    document.addEventListener("keydown", this.keydownHandler);

    this.render();
    return this.container;
  }

  onRemove() {
    this.container?.remove();
    this.buttons.clear();
    if (this.documentPointerHandler) {
      document.removeEventListener("pointerdown", this.documentPointerHandler);
    }
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
    }
    this.map = null;
    this.container = null;
    this.panel = null;
    this.activeButton = null;
    this.items = [];
    this.documentPointerHandler = null;
    this.keydownHandler = null;
    this.isOpen = false;
  }

  render() {
    this.renderActiveButton();
    this.renderPanel();
  }

  renderActiveButton() {
    const visibleBasemapId = this.previewBasemapId ?? this.activeBasemapId;
    const activeDefinition = this.items.find((item) => item.id === visibleBasemapId) ?? this.items[0];

    if (!activeDefinition || !this.activeButton) {
      return;
    }

    this.activeButton.innerHTML = "";
    this.activeButton.title = activeDefinition.name;

    const activeTile = document.createElement("span");
    activeTile.className = "vtb-active-tile";
    activeTile.appendChild(createPreviewElement(activeDefinition));
    this.activeButton.appendChild(activeTile);

    const meta = document.createElement("span");
    meta.className = "vtb-toggle-meta";

    const name = document.createElement("span");
    name.className = "vtb-toggle-name";
    name.textContent = activeDefinition.name;
    meta.appendChild(name);

    const group = document.createElement("span");
    group.className = "vtb-toggle-group";
    group.textContent = (this.options.groupBy ?? "variant") === "provider" ? activeDefinition.provider : activeDefinition.variant;
    meta.appendChild(group);

    this.activeButton.appendChild(meta);

    const caret = document.createElement("span");
    caret.className = "vtb-toggle-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▾";
    this.activeButton.appendChild(caret);
  }

  renderPanel() {
    if (!this.panel) {
      return;
    }

    this.panel.innerHTML = "";
    this.buttons.clear();

    const groupBy = this.options.groupBy ?? "variant";
    const grouped = new Map();

    for (const definition of this.items) {
      const key = groupBy === "provider" ? definition.provider : definition.variant;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key).push(definition);
    }

    for (const [groupKey, definitions] of grouped.entries()) {
      const section = document.createElement("section");
      section.className = "vtb-group";

      const title = document.createElement("div");
      title.className = "vtb-group-title";
      title.textContent = groupLabel(groupKey, groupBy);
      section.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "vtb-grid";

      for (const definition of definitions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vtb-button";
      button.title = definition.name;
      button.setAttribute("aria-label", `Use ${definition.name}`);
      button.setAttribute("aria-pressed", String(definition.id === this.previewBasemapId));
      button.dataset.selected = String(definition.id === this.activeBasemapId);

      button.appendChild(createPreviewElement(definition));

      button.addEventListener("pointerenter", () => {
        this.previewBasemap(definition.id);
      });

      button.addEventListener("focus", () => {
        this.previewBasemap(definition.id);
      });

      button.addEventListener("click", async () => {
        for (const candidate of this.buttons.values()) {
          candidate.disabled = true;
        }

        try {
          await this.applyBasemapId(definition.id, { commit: true });
          this.setPanelOpen(false);
        } finally {
          for (const candidate of this.buttons.values()) {
            candidate.disabled = false;
          }
        }
      });

      this.buttons.set(definition.id, button);
      grid.appendChild(button);
    }

      section.appendChild(grid);
      this.panel.appendChild(section);
    }
  }

  setActiveBasemap(id) {
    this.activeBasemapId = id;
    this.render();
  }

  async applyBasemapId(id, { commit = false } = {}) {
    if (!this.map) {
      return null;
    }

    const sequence = ++this.applySequence;
    const definition = getBasemap(id);

    if (!definition) {
      return null;
    }

    await applyBasemap(this.map, id, this.options.applyOptions ?? {});

    if (sequence !== this.applySequence) {
      return definition;
    }

    if (commit) {
      this.previewBasemapId = null;
      this.activeBasemapId = id;
      this.options.onChange?.(definition);
    } else {
      this.previewBasemapId = id;
      this.options.onPreview?.(definition);
    }

    this.render();
    return definition;
  }

  previewBasemap(id) {
    if (!this.isOpen || id === this.previewBasemapId || id === this.activeBasemapId && this.previewBasemapId == null) {
      return;
    }

    void this.applyBasemapId(id);
  }

  restoreActiveBasemapPreview() {
    if (!this.previewBasemapId || this.previewBasemapId === this.activeBasemapId) {
      this.previewBasemapId = null;
      this.options.onPreview?.(getBasemap(this.activeBasemapId));
      this.render();
      return;
    }

    const activeBasemapId = this.activeBasemapId;
    this.previewBasemapId = null;
    this.options.onPreview?.(getBasemap(activeBasemapId));
    void this.applyBasemapId(activeBasemapId);
  }

  togglePanel() {
    this.setPanelOpen(!this.isOpen);
  }

  setPanelOpen(open) {
    if (!open) {
      this.restoreActiveBasemapPreview();
    }

    this.isOpen = open;

    if (!this.container || !this.panel || !this.activeButton) {
      return;
    }

    this.container.dataset.open = String(open);
    this.panel.hidden = !open;
    this.activeButton.setAttribute("aria-expanded", String(open));
  }
}

export function createBasemapControl(options = {}) {
  return new BasemapControl(options);
}
