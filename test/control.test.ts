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

function waitForMicrotasks(): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, 0));
}

function mountControl(options: {
  onBasemapChange?: (event: BasemapChangeEvent) => void;
  onPreview?: (basemap: Parameters<NonNullable<import("../src/index.js").BasemapControlOptions["onPreview"]>>[0]) => void;
} = {}) {
  const map = new MockMap();
  document.body.appendChild(map.container);
  const control = new BasemapControl({
    registry: fixtureRegistry,
    basemapIds: ["fixture.vector", "fixture.raster"],
    initialBasemapId: "fixture.vector",
    onBasemapChange: options.onBasemapChange,
    onPreview: options.onPreview,
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
    await waitForMicrotasks();

    expect(map.styleCalls).toHaveLength(1);
    expect(onBasemapChange).toHaveBeenCalledWith(expect.objectContaining({
      basemap: expect.objectContaining({ id: "fixture.raster" }),
      previousBasemap: expect.objectContaining({ id: "fixture.vector" }),
    }));

    control.onRemove();
  });

  it("uses the committed basemap as previousBasemap after previewing the clicked item", async () => {
    const onBasemapChange = vi.fn();
    const { control, element } = mountControl({ onBasemapChange });
    element.querySelector<HTMLButtonElement>(".vtb-toggle")?.click();
    const rasterButton = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")][1];

    rasterButton?.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    await waitForMicrotasks();
    rasterButton?.click();
    await waitForMicrotasks();

    expect(onBasemapChange).toHaveBeenCalledWith(expect.objectContaining({
      basemap: expect.objectContaining({ id: "fixture.raster" }),
      previousBasemap: expect.objectContaining({ id: "fixture.vector" }),
    }));

    control.onRemove();
  });

  it("does not let a stale preview overwrite a newer committed basemap", async () => {
    const registry = createBasemapRegistry([
      {
        id: "fixture.slow",
        name: "Fixture Slow",
        provider: "fixture",
        group: "general",
        style: "https://example.test/slow.json",
        variant: "light",
        coverage: "world",
        sourceType: "vector",
      },
      {
        id: "fixture.fast",
        name: "Fixture Fast",
        provider: "fixture",
        group: "general",
        style: "https://example.test/fast.json",
        variant: "dark",
        coverage: "world",
        sourceType: "vector",
      },
    ], {
      providers: [{ id: "fixture", name: "Fixture", url: "https://example.test" }],
      groups: [{ id: "general", label: "General" }],
    });
    const map = new MockMap();
    document.body.appendChild(map.container);
    let resolveSlow: () => void = () => {
      throw new Error("Slow response was not requested.");
    };
    let resolveFast: () => void = () => {
      throw new Error("Fast response was not requested.");
    };
    const fetcher = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return new Promise<Response>((resolve) => {
        if (url.includes("slow")) {
          resolveSlow = () => resolve(new Response(JSON.stringify({ version: 8, sources: {}, layers: [] })));
          return;
        }

        resolveFast = () => resolve(new Response(JSON.stringify({
          version: 8,
          sources: { fast: { type: "raster", tiles: ["https://example.test/{z}/{x}/{y}.png"] } },
          layers: [{ id: "fast", type: "raster", source: "fast" }],
        })));
      });
    }) as unknown as typeof fetch;
    const control = new BasemapControl({
      registry,
      basemapIds: ["fixture.slow", "fixture.fast"],
      initialBasemapId: "fixture.fast",
      applyOptions: { fetch: fetcher },
    });
    const element = control.onAdd(map.asMap());
    map.container.appendChild(element);

    element.querySelector<HTMLButtonElement>(".vtb-toggle")?.click();
    const [slowButton, fastButton] = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")];
    slowButton?.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    await waitForMicrotasks();
    fastButton?.click();
    await waitForMicrotasks();

    resolveFast();
    await waitForMicrotasks();
    resolveSlow();
    await waitForMicrotasks();

    expect(map.styleCalls).toHaveLength(1);
    expect(map.styleCalls[0]?.style.layers[0]?.id).toBe("fast");

    control.onRemove();
  });

  it("previews on hover and restores the active basemap on pointer leave", async () => {
    const onPreview = vi.fn();
    const { control, element, map } = mountControl({ onPreview });
    const toggle = element.querySelector<HTMLButtonElement>(".vtb-toggle");
    toggle?.click();

    const rasterButton = [...element.querySelectorAll<HTMLButtonElement>(".vtb-button")][1];
    rasterButton?.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    await waitForMicrotasks();

    expect(map.styleCalls).toHaveLength(1);
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ id: "fixture.raster" }));
    expect(element.querySelector<HTMLElement>('.vtb-button[data-previewed="true"]')).toBeTruthy();

    const panel = element.querySelector<HTMLElement>(".vtb-panel");
    panel?.dispatchEvent(new Event("pointerleave", { bubbles: true }));
    await waitForMicrotasks();

    expect(map.styleCalls).toHaveLength(2);
    expect(onPreview).toHaveBeenLastCalledWith(expect.objectContaining({ id: "fixture.vector" }));

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

  it("normalizes an invalid active basemap id to a visible item", () => {
    const { control, element } = mountControl();

    control.setActiveBasemap("missing");

    expect(element.querySelector<HTMLElement>(".vtb-toggle")?.textContent).toContain("Fixture Vector");

    control.onRemove();
  });
});
