import { describe, expect, it, vi } from "vitest";
import {
  BasemapControl,
  createBasemapRegistry,
  type BasemapChangeEvent,
} from "../src/index.js";
import { fixtureBasemaps, MockMap } from "./fixtures.js";

const fixtureRegistry = createBasemapRegistry(fixtureBasemaps, {
  providers: [{ id: "fixture", name: "Fixture", url: "https://example.test" }],
  groups: [{ id: "general", label: "General" }, { id: "raster", label: "Raster" }],
});

function mountControl(options: {
  onBasemapChange?: (event: BasemapChangeEvent) => void;
} = {}) {
  const map = new MockMap();
  document.body.appendChild(map.container);
  const control = new BasemapControl({
    registry: fixtureRegistry,
    basemapIds: ["fixture.vector", "fixture.raster"],
    initialBasemapId: "fixture.vector",
    onBasemapChange: options.onBasemapChange,
  });
  const element = control.onAdd(map.asMap());
  map.container.appendChild(element);

  return { control, element, map };
}

describe("BasemapControl", () => {
  it("implements MapLibre control markup and default position", () => {
    const { control, element } = mountControl();

    expect(control.getDefaultPosition()).toBe("top-right");
    expect(element.classList.contains("maplibregl-ctrl")).toBe(true);
    expect(element.classList.contains("maplibregl-ctrl-group")).toBe(true);
    expect(element.classList.contains("vtb-basemap-control")).toBe(true);
    expect(element.querySelector(".vtb-toggle")?.getAttribute("aria-expanded")).toBe("false");

    control.onRemove();
  });

  it("supports a configured default position", () => {
    const control = new BasemapControl({
      registry: fixtureRegistry,
      position: "bottom-left",
    });

    expect(control.getDefaultPosition()).toBe("bottom-left");
  });

  it("expands, marks active basemap, and exposes ARIA radio state", () => {
    const { control, element } = mountControl();
    const toggle = element.querySelector<HTMLButtonElement>(".vtb-toggle");

    toggle?.click();

    const panel = element.querySelector<HTMLElement>(".vtb-panel");
    const buttons = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")];

    expect(panel?.hidden).toBe(false);
    expect(panel?.getAttribute("role")).toBe("radiogroup");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute("role")).toBe("radio");
    expect(buttons[0]?.getAttribute("aria-checked")).toBe("true");
    expect(buttons[1]?.getAttribute("aria-checked")).toBe("false");

    control.onRemove();
  });

  it("supports roving keyboard navigation", () => {
    const { control, element } = mountControl();
    const toggle = element.querySelector<HTMLButtonElement>(".vtb-toggle");
    toggle?.click();

    const panel = element.querySelector<HTMLElement>(".vtb-panel");
    const buttons = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")];
    buttons[0]?.focus();

    panel?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);

    panel?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    panel?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(panel?.hidden).toBe(true);
    expect(document.activeElement).toBe(toggle);

    control.onRemove();
  });

  it("applies a basemap and emits onBasemapChange", async () => {
    const onBasemapChange = vi.fn();
    const { control, element, map } = mountControl({ onBasemapChange });
    element.querySelector<HTMLButtonElement>(".vtb-toggle")?.click();
    const rasterButton = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")][1];

    rasterButton?.click();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));

    expect(map.styleCalls).toHaveLength(1);
    expect(onBasemapChange).toHaveBeenCalledWith(expect.objectContaining({
      basemap: expect.objectContaining({ id: "fixture.raster" }),
      previousBasemap: expect.objectContaining({ id: "fixture.vector" }),
    }));

    control.onRemove();
  });

  it("cleans document listeners on remove", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { control, element } = mountControl();

    control.onRemove();

    expect(removeSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(document.body.contains(element)).toBe(false);
  });
});
