import { describe, expect, it, vi } from "vitest";
import {
  applyBasemap,
  createBasemapRegistry,
  loadBasemapStyle,
  resolveBasemapStyle,
  styleUsesPmtiles,
  validateStyleDocument,
} from "../src/index.js";
import { alternateStyle, emptyStyle, fixtureBasemaps, MockMap } from "./fixtures.js";

const fixtureRegistry = createBasemapRegistry(fixtureBasemaps, {
  providers: [{ id: "fixture", name: "Fixture", url: "https://example.test" }],
  groups: [{ id: "general", label: "General" }, { id: "raster", label: "Raster" }],
});

describe("style loading", () => {
  it("resolves style objects and URLs", () => {
    const inline = resolveBasemapStyle("fixture.vector", { registry: fixtureRegistry });
    const remote = resolveBasemapStyle("openfreemap.liberty");

    expect(inline.style).toEqual(emptyStyle);
    expect(remote.url).toBe("https://tiles.openfreemap.org/styles/liberty");
  });

  it("validates MapLibre style documents", () => {
    expect(validateStyleDocument(emptyStyle)).toEqual(emptyStyle);
    expect(() => validateStyleDocument({ version: 7, sources: {}, layers: [] })).toThrow(/version 8/);
    expect(() => validateStyleDocument({ version: 8, layers: [] })).toThrow(/sources/);
  });

  it("detects pmtiles style usage", async () => {
    const style = await loadBasemapStyle("fixture.pmtiles", { registry: fixtureRegistry });
    expect(styleUsesPmtiles(style)).toBe(true);
  });

  it("loads URL styles through an injected fetcher", async () => {
    const registry = createBasemapRegistry([
      {
        id: "fixture.url",
        name: "Fixture URL",
        provider: "fixture",
        group: "general",
        style: "https://example.test/style.json",
        variant: "light",
        coverage: "world",
        sourceType: "vector",
      },
    ]);
    const fetcher = vi.fn(async () => new Response(JSON.stringify(alternateStyle)));

    const style = await loadBasemapStyle("fixture.url", { registry, fetch: fetcher });

    expect(fetcher).toHaveBeenCalledWith("https://example.test/style.json", { signal: undefined });
    expect(style.layers[0]?.id).toBe("raster");
  });
});

describe("applyBasemap", () => {
  it("preloads style documents before mutating the map", async () => {
    const registry = createBasemapRegistry([
      {
        id: "broken",
        name: "Broken",
        provider: "fixture",
        group: "general",
        style: "https://example.test/missing.json",
        variant: "light",
        coverage: "world",
        sourceType: "vector",
      },
    ]);
    const map = new MockMap();
    const onBasemapError = vi.fn();
    const fetcher = vi.fn(async () => new Response("missing", { status: 404, statusText: "Not Found" }));

    await expect(applyBasemap(map.asMap(), "broken", {
      registry,
      fetch: fetcher,
      onBasemapError,
    })).rejects.toThrow(/Failed to load/);

    expect(map.styleCalls).toHaveLength(0);
    expect(onBasemapError).toHaveBeenCalledOnce();
  });

  it("preserves camera and applies setStyle with diff disabled by default", async () => {
    const map = new MockMap();

    const result = await applyBasemap(map.asMap(), "fixture.vector", {
      registry: fixtureRegistry,
    });

    expect(result.basemap.id).toBe("fixture.vector");
    expect(map.styleCalls).toHaveLength(1);
    expect(map.styleCalls[0]?.options).toEqual({ diff: false });
    expect(map.jumpCalls[0]).toEqual({
      center: [8, 47],
      zoom: 10,
      bearing: 5,
      pitch: 20,
    });
  });

  it("runs overlay capture and restore around style load", async () => {
    const map = new MockMap();
    const captureOverlays = vi.fn(() => ({ layerIds: ["overlay"] }));
    const restoreOverlays = vi.fn();

    const promise = applyBasemap(map.asMap(), "fixture.vector", {
      registry: fixtureRegistry,
      captureOverlays,
      restoreOverlays,
    });

    for (let index = 0; index < 5 && map.styleCalls.length === 0; index += 1) {
      await Promise.resolve();
    }
    expect(captureOverlays).toHaveBeenCalledOnce();
    expect(restoreOverlays).not.toHaveBeenCalled();

    map.emit("style.load");
    await promise;

    expect(restoreOverlays).toHaveBeenCalledWith(
      { layerIds: ["overlay"] },
      expect.objectContaining({ basemap: expect.objectContaining({ id: "fixture.vector" }) }),
    );
  });

  it("aborts before restoring overlays", async () => {
    const map = new MockMap();
    const abortController = new AbortController();
    const restoreOverlays = vi.fn();

    const promise = applyBasemap(map.asMap(), "fixture.vector", {
      registry: fixtureRegistry,
      restoreOverlays,
      signal: abortController.signal,
    });

    for (let index = 0; index < 5 && map.styleCalls.length === 0; index += 1) {
      await Promise.resolve();
    }

    abortController.abort();

    await expect(promise).rejects.toThrow(/aborted/);
    expect(restoreOverlays).not.toHaveBeenCalled();
  });

  it("does not report aborted basemap loads as basemap errors", async () => {
    const map = new MockMap();
    const abortController = new AbortController();
    const onBasemapError = vi.fn();

    abortController.abort();

    await expect(applyBasemap(map.asMap(), "fixture.vector", {
      registry: fixtureRegistry,
      signal: abortController.signal,
      onBasemapError,
    })).rejects.toThrow(/aborted/);

    expect(onBasemapError).not.toHaveBeenCalled();
    expect(map.styleCalls).toHaveLength(0);
  });
});
