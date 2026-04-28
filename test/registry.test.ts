import { describe, expect, it } from "vitest";
import {
  basemapGroups,
  createBasemapRegistry,
  getBasemap,
  getBasemapPreviewCandidates,
  listBasemaps,
  providerRegistry,
} from "../src/index.js";
import { fixtureBasemaps } from "./fixtures.js";

describe("basemap registry", () => {
  it("filters by ids in requested order", () => {
    const items = listBasemaps({
      ids: ["openfreemap.dark", "vectormap.light", "carto.light.raster"],
    });

    expect(items.map((item) => item.id)).toEqual([
      "openfreemap.dark",
      "vectormap.light",
      "carto.light.raster",
    ]);
  });

  it("filters by provider, group, source type, and country", () => {
    expect(listBasemaps({ provider: "openfreemap", sourceType: "vector" }).length).toBeGreaterThan(2);
    expect(listBasemaps({ group: "raster" }).map((item) => item.id)).toContain("carto.light.raster");
    expect(listBasemaps({ country: "CH" }).map((item) => item.provider)).toContain("swisstopo");
  });

  it("exposes provider and group registries", () => {
    expect(providerRegistry.some((provider) => provider.id === "openfreemap")).toBe(true);
    expect(basemapGroups.some((group) => group.id === "raster")).toBe(true);
  });

  it("creates isolated custom registries", () => {
    const registry = createBasemapRegistry(fixtureBasemaps, {
      providers: [{ id: "fixture", name: "Fixture", url: "https://example.test" }],
      groups: [{ id: "general", label: "General" }, { id: "raster", label: "Raster" }],
    });

    expect(registry.list({ sourceType: "raster" })).toHaveLength(1);
    expect(registry.getProvider("fixture")?.name).toBe("Fixture");
    expect(registry.getGroup("raster")?.label).toBe("Raster");
  });

  it("returns cloned definitions", () => {
    const first = getBasemap("openfreemap.liberty");
    const second = getBasemap("openfreemap.liberty");

    expect(first).not.toBe(second);
    expect(first?.rasterFallback?.tiles).not.toBe(second?.rasterFallback?.tiles);
  });

  it("prefers local preview assets before remote preview URLs", () => {
    const previews = getBasemapPreviewCandidates("vectormap.light");

    expect(previews[0]).toMatch(/preview-generator\/generated\/vectormap\.light\.png$/);
    expect(previews[1]).toMatch(/^https:\/\/raw\.githubusercontent\.com\//);
  });
});
