# vector-tiles-basemaps

Typed MapLibre GL JS basemap control for modern vector style URLs, provider registries, PMTiles-ready styles, and raster fallback examples.

`ka7eh/maplibre-gl-basemaps` is useful for raster tile switching. This package targets the newer MapLibre style workflow: full style documents, vector tile basemaps, provider metadata, TypeScript types, accessibility, and a control that implements MapLibre's `IControl` pattern.

## Features

- MapLibre-compatible `BasemapControl` for `map.addControl(new BasemapControl(...), "top-right")`
- TypeScript-first API with generated `.d.ts`
- ESM package with exported `vector-tiles-basemaps/style.css`
- Curated provider registry for vector styles plus one raster comparison basemap
- Style URL and inline `StyleSpecification` support
- Optional PMTiles protocol helper without a hard PMTiles dependency
- Camera-preserving style switching with opt-in overlay capture/restore hooks
- Accessible expand/collapse UI with thumbnail previews and keyboard navigation

## Installation

```bash
npm install vector-tiles-basemaps maplibre-gl
```

For PMTiles-backed styles, install `pmtiles` in your app:

```bash
npm install pmtiles
```

## Minimal MapLibre Example

```ts
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  BasemapControl,
  applyBasemap,
} from "vector-tiles-basemaps";
import "vector-tiles-basemaps/style.css";

const map = new maplibregl.Map({
  container: "map",
  style: { version: 8, sources: {}, layers: [] },
  center: [8.7241, 47.4988],
  zoom: 10.8,
});

await applyBasemap(map, "openfreemap.liberty");

map.addControl(
  new BasemapControl({
    basemapIds: [
      "openfreemap.liberty",
      "openfreemap.dark",
      "versatiles.graybeard",
      "vectormap.light",
      "carto.light.raster",
    ],
    initialBasemapId: "openfreemap.liberty",
    onBasemapChange(event) {
      console.log("Basemap changed", event.basemap.id);
    },
  }),
  "top-right",
);
```

## Public API

```ts
import {
  BasemapControl,
  createBasemapControl,
  applyBasemap,
  loadBasemapStyle,
  resolveBasemapStyle,
  listBasemaps,
  getBasemap,
  createBasemapRegistry,
  basemapRegistry,
  providerRegistry,
  basemapGroups,
  registerPmtilesProtocol,
} from "vector-tiles-basemaps";
```

Primary exported types:

- `BasemapDefinition`
- `BasemapProvider`
- `BasemapGroup`
- `BasemapControlOptions`
- `BasemapChangeEvent`
- `BasemapErrorEvent`
- `BasemapRegistryFilters`
- `CaptureOverlaysCallback`
- `RestoreOverlaysCallback`

## BasemapDefinition

```ts
type BasemapDefinition = {
  id: string;
  name: string;
  provider: string;
  group: string;
  style: string | StyleSpecification;
  styleUrl?: string; // deprecated compatibility alias
  variant: "light" | "dark" | "relief" | "imagery" | "colorful" | "gray" | "white" | "black";
  coverage: "world" | "country" | "region";
  sourceType: "vector" | "raster" | "hybrid";
  attributionHtml?: string;
  license?: string;
  previewUrl?: string;
  rasterFallback?: { tiles: readonly string[]; tileSize?: number };
  protocols?: readonly "pmtiles"[];
};
```

`style` is the canonical field. It may be a MapLibre style URL or a `StyleSpecification` object. `styleUrl` is kept only as a transition alias.

## Registry And Filtering

```ts
const vectorMaps = listBasemaps({ sourceType: "vector" });
const swissMaps = listBasemaps({ country: "CH" });
const selected = listBasemaps({
  ids: ["vectormap.light", "openfreemap.dark", "carto.light.raster"],
});
```

Custom registries are first-class:

```ts
const registry = createBasemapRegistry([
  {
    id: "custom.light",
    name: "Custom Light",
    provider: "custom",
    group: "general",
    style: "https://example.com/style.json",
    variant: "light",
    coverage: "world",
    sourceType: "vector",
  },
]);

map.addControl(new BasemapControl({ registry }), "top-right");
```

## Style Switching

`applyBasemap` loads and validates the target style before calling `map.setStyle`, so a failed fetch does not wipe the current map. The current camera is preserved by default.

```ts
await applyBasemap(map, "openfreemap.dark", {
  preserveView: true,
  repositionIfOutsideCoverage: true,
  onBasemapError(event) {
    console.error(event.basemapId, event.error);
  },
});
```

Overlay preservation is opt-in because applications differ in how overlays are owned:

```ts
await applyBasemap(map, "versatiles.graybeard", {
  captureOverlays({ map }) {
    return {
      sources: map.getStyle().sources,
      layers: map.getStyle().layers.filter((layer) => layer.id.startsWith("app-")),
    };
  },
  restoreOverlays(snapshot, { map }) {
    // Re-add application-owned sources and layers after style.load.
  },
});
```

## PMTiles

The package does not install or register PMTiles globally. Register it explicitly when your styles use `pmtiles://` sources:

```ts
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import { registerPmtilesProtocol } from "vector-tiles-basemaps";

const unregisterPmtiles = registerPmtilesProtocol(maplibregl, pmtiles);

// Later, during app teardown if desired:
unregisterPmtiles();
```

## Styling

Import the CSS bundle once:

```ts
import "vector-tiles-basemaps/style.css";
```

The root control element uses:

```html
<div class="maplibregl-ctrl maplibregl-ctrl-group vtb-basemap-control">
```

Override CSS custom properties on `.vtb-basemap-control` to align with your app theme.

## Accessibility

The control uses a real button for expand/collapse, a `radiogroup` for choices, `aria-expanded`, `aria-controls`, `aria-checked`, visible focus states, `Escape`, arrow-key roving focus, `Home`, and `End`.

## Included Providers

The default registry includes vector styles from vectormap, OpenFreeMap, VersaTiles, basemap.world, and swisstopo, plus a CARTO raster basemap for comparison and fallback workflows. Check each provider's usage policy and attribution terms before production use.

## Demo

```bash
npm install
npm run demo:dev
```

The demo imports the package API and `vector-tiles-basemaps/style.css` through Vite aliases, matching consumer import paths.

## Development

```bash
npm ci
npm run lint
npm run test
npm run test:types
npm run build
```

Live provider style validation is available but network-dependent:

```bash
npm run validate:styles
```

## Release

Changesets are configured for release management:

```bash
npm run changeset
npm run build
npm run release
```
