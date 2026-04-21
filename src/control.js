import { applyBasemap } from "./styles.js";
import { listBasemaps } from "./basemaps.js";

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
      border-radius: 14px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
      padding: 10px;
      width: 144px;
      backdrop-filter: blur(12px);
      font: 12px/1.2 "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    }

    .vtb-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .vtb-button {
      appearance: none;
      background: #fff;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      min-height: 58px;
      overflow: hidden;
      padding: 8px;
      position: relative;
      text-align: left;
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
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

    .vtb-thumb {
      inset: 0;
      position: absolute;
      background-position: center;
      background-size: cover;
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

    .vtb-caption {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.82);
      border-radius: 999px;
      color: #0f172a;
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      max-width: 100%;
      overflow: hidden;
      padding: 3px 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
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

  if (definition.previewUrl) {
    preview.style.backgroundImage = `url("${definition.previewUrl}")`;
  } else {
    preview.classList.add("vtb-thumb--fallback");
    preview.dataset.shortLabel = shortLabel(definition.name);
    preview.style.background = variantBackgrounds[definition.variant] ?? variantBackgrounds.light;
  }

  return preview;
}

export class BasemapControl {
  constructor(options = {}) {
    this.options = options;
    this.map = null;
    this.container = null;
    this.buttons = new Map();
    this.activeBasemapId = options.initialBasemapId ?? null;
  }

  onAdd(map) {
    ensureControlStyles();

    this.map = map;
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl vtb-control";

    const grid = document.createElement("div");
    grid.className = "vtb-grid";

    const items = this.options.basemapIds
      ? listBasemaps({ ids: this.options.basemapIds })
      : listBasemaps(this.options.filters ?? {});

    for (const definition of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vtb-button";
      button.setAttribute("aria-label", `Use ${definition.name}`);
      button.setAttribute("aria-pressed", String(definition.id === this.activeBasemapId));

      button.appendChild(createPreviewElement(definition));

      const caption = document.createElement("span");
      caption.className = "vtb-caption";
      caption.textContent = definition.name;
      button.appendChild(caption);

      button.addEventListener("click", async () => {
        if (!this.map) {
          return;
        }

        button.disabled = true;

        try {
          await applyBasemap(this.map, definition.id, this.options.applyOptions ?? {});
          this.setActiveBasemap(definition.id);
          this.options.onChange?.(definition);
        } finally {
          button.disabled = false;
        }
      });

      this.buttons.set(definition.id, button);
      grid.appendChild(button);
    }

    this.container.appendChild(grid);
    return this.container;
  }

  onRemove() {
    this.container?.remove();
    this.buttons.clear();
    this.map = null;
    this.container = null;
  }

  setActiveBasemap(id) {
    this.activeBasemapId = id;

    for (const [buttonId, button] of this.buttons.entries()) {
      button.setAttribute("aria-pressed", String(buttonId === id));
    }
  }
}

export function createBasemapControl(options = {}) {
  return new BasemapControl(options);
}
