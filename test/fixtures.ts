import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import type { BasemapDefinition } from "../src/index.js";

export const emptyStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#eef2f3" },
    },
  ],
};

export const alternateStyle: StyleSpecification = {
  version: 8,
  sources: {
    raster: {
      type: "raster",
      tiles: ["https://example.test/{z}/{x}/{y}.png"],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "raster",
      type: "raster",
      source: "raster",
    },
  ],
};

export const fixtureBasemaps: BasemapDefinition[] = [
  {
    id: "fixture.vector",
    name: "Fixture Vector",
    provider: "fixture",
    group: "general",
    style: emptyStyle,
    variant: "light",
    coverage: "world",
    sourceType: "vector",
  },
  {
    id: "fixture.raster",
    name: "Fixture Raster",
    provider: "fixture",
    group: "raster",
    style: alternateStyle,
    variant: "light",
    coverage: "world",
    sourceType: "raster",
    rasterFallback: {
      tiles: ["https://example.test/fallback/{z}/{x}/{y}.png"],
    },
  },
  {
    id: "fixture.pmtiles",
    name: "Fixture PMTiles",
    provider: "fixture",
    group: "general",
    style: {
      version: 8,
      sources: {
        pmtiles: {
          type: "vector",
          url: "pmtiles://https://example.test/world.pmtiles",
        },
      },
      layers: [],
    },
    variant: "light",
    coverage: "world",
    sourceType: "vector",
    protocols: ["pmtiles"],
  },
];

type Listener = (...args: unknown[]) => void;

export class MockMap {
  readonly container = document.createElement("div");
  center = { lng: 8, lat: 47 };
  zoom = 10;
  bearing = 5;
  pitch = 20;
  styleCalls: Array<{ style: StyleSpecification; options: unknown }> = [];
  jumpCalls: unknown[] = [];
  private readonly listeners = new Map<string, Listener[]>();

  getContainer(): HTMLElement {
    return this.container;
  }

  getCenter(): { lng: number; lat: number } {
    return this.center;
  }

  getZoom(): number {
    return this.zoom;
  }

  getBearing(): number {
    return this.bearing;
  }

  getPitch(): number {
    return this.pitch;
  }

  setStyle(style: StyleSpecification, options: unknown): this {
    this.styleCalls.push({ style, options });
    return this;
  }

  jumpTo(options: unknown): this {
    this.jumpCalls.push(options);
    return this;
  }

  once(eventName: string, listener: Listener): this {
    this.listeners.set(eventName, [...(this.listeners.get(eventName) ?? []), listener]);
    return this;
  }

  off(eventName: string, listener: Listener): this {
    this.listeners.set(
      eventName,
      (this.listeners.get(eventName) ?? []).filter((candidate) => candidate !== listener),
    );
    return this;
  }

  emit(eventName: string, ...args: unknown[]): void {
    const listeners = this.listeners.get(eventName) ?? [];
    this.listeners.delete(eventName);
    listeners.forEach((listener) => listener(...args));
  }

  asMap(): MapLibreMap {
    return this as unknown as MapLibreMap;
  }
}
