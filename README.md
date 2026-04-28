# vector-tiles-basemaps

MapLibre GL JS basemap control for modern vector style URLs, provider registries, PMTiles-ready styles, and raster fallback examples.

This package is meant to feel like a native MapLibre control:

- `BasemapControl` implements the MapLibre `IControl` pattern
- it can be added with `map.addControl(...)`
- the control position can be chosen by the integrator
- vector style URLs are first-class
- it works in TypeScript projects and also in plain browser HTML via direct `import`

## Why this instead of `maplibre-gl-basemaps`?

`ka7eh/maplibre-gl-basemaps` is aimed at raster basemap switching.

`vector-tiles-basemaps` adds the parts that matter for modern MapLibre work:

- vector style URLs and full `StyleSpecification` support
- typed basemap and provider registry
- MapLibre-style `IControl` integration
- optional PMTiles protocol support
- accessibility and keyboard navigation
- browser import usage without requiring a bundler in the consumer page

## Use It 3 Ways

### 1. npm + bundler

Use this in Vite, Webpack, Rollup, Astro, React, Vue, Svelte, or similar setups.

```bash
npm install vector-tiles-basemaps maplibre-gl
```

```ts
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BasemapControl, applyBasemap } from "vector-tiles-basemaps";
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
    basemapIds: ["openfreemap.liberty", "openfreemap.dark", "versatiles.graybeard"],
    position: "bottom-left",
  }),
);
```

### 2. Direct browser import from local files

Use this when you already have the built `dist/` files and want to drop the control into a plain HTML page.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css">
    <link rel="stylesheet" href="./dist/style.css">
    <style>
      html, body, #map { height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script type="module">
      import maplibregl from "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/+esm";
      import { BasemapControl, applyBasemap } from "./dist/index.js";

      const map = new maplibregl.Map({
        container: "map",
        style: { version: 8, sources: {}, layers: [] },
        center: [8.7241, 47.4988],
        zoom: 10.8,
      });

      await applyBasemap(map, "openfreemap.liberty");
      map.addControl(new BasemapControl({ position: "bottom-left" }));
    </script>
  </body>
</html>
```

### 3. Direct browser import from a CDN

Use this after the package is published and you want zero local package installation in the consuming app.

```html
<script type="module">
  import maplibregl from "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/+esm";
  import {
    BasemapControl,
    applyBasemap
  } from "https://cdn.jsdelivr.net/npm/vector-tiles-basemaps/dist/index.js";

  import "https://cdn.jsdelivr.net/npm/vector-tiles-basemaps/dist/style.css";
</script>
```

If your target environment does not support CSS `import` in modules, use a normal `<link rel="stylesheet">` for `dist/style.css`.

## Minimal API

```ts
import {
  BasemapControl,
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

## Positioning The Control

There are two normal MapLibre-style ways to choose where the control appears.

### Option A: use `position` on the control

```ts
map.addControl(
  new BasemapControl({
    position: "bottom-left",
  }),
);
```

### Option B: use the standard MapLibre `addControl` position argument

```ts
map.addControl(
  new BasemapControl(),
  "bottom-left",
);
```

If both are provided, the explicit `map.addControl(control, position)` argument is the MapLibre-native choice and should be preferred by integrators.

## BasemapControl

`BasemapControl` is the main UI control.

```ts
const control = new BasemapControl({
  basemapIds: [
    "openfreemap.liberty",
    "openfreemap.dark",
    "versatiles.graybeard",
    "carto.light.raster",
  ],
  initialBasemapId: "openfreemap.liberty",
  groupBy: "provider",
  position: "bottom-left",
  onBasemapChange(event) {
    console.log(event.basemap.id);
  },
  onBasemapError(event) {
    console.error(event.basemapId, event.error);
  },
});

map.addControl(control);
```

Important options:

- `basemapIds`: limit the control to specific basemaps
- `filters`: filter the default registry
- `registry`: inject your own basemap registry
- `position`: default MapLibre control position
- `initialBasemapId`: selected basemap at control creation
- `groupBy`: `"group" | "provider" | "variant" | "sourceType"`
- `onBasemapChange`: called after a successful basemap switch
- `onBasemapError`: called when loading or applying a basemap fails

## Applying A Basemap Without The Control

If you only want the switching logic and not the UI:

```ts
await applyBasemap(map, "openfreemap.dark", {
  preserveView: true,
  repositionIfOutsideCoverage: true,
});
```

This loads and validates the target style before calling `map.setStyle`, so a broken style does not wipe the current map first.

## Using Your Own Basemaps

```ts
import { createBasemapRegistry, BasemapControl, applyBasemap } from "vector-tiles-basemaps";

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

await applyBasemap(map, "custom.light", { registry });
map.addControl(new BasemapControl({ registry, position: "bottom-left" }));
```

## PMTiles

The package does not auto-register PMTiles globally. Register it explicitly when one of your basemaps uses `pmtiles://`.

```ts
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import { registerPmtilesProtocol } from "vector-tiles-basemaps";

const unregisterPmtiles = registerPmtilesProtocol(maplibregl, pmtiles);
```

## Styling

Import the CSS once:

```ts
import "vector-tiles-basemaps/style.css";
```

The control root is:

```html
<div class="maplibregl-ctrl maplibregl-ctrl-group vtb-basemap-control">
```

That keeps it aligned with MapLibre's control model and styling conventions.

## Accessibility

The control includes:

- `aria-expanded`
- `aria-controls`
- `role="radiogroup"`
- `aria-checked`
- keyboard support for `Escape`, arrow keys, `Home`, and `End`

## Included Providers

The default registry currently includes vector styles from:

- `vectormap`
- `OpenFreeMap`
- `VersaTiles`
- `basemap.world`
- `swisstopo`

It also includes one raster comparison basemap:

- `carto.light.raster`

## Demo

The top-level [`index.html`](C:\Users\fabia\GitHub\vector-tiles-basemaps\index.html) is now the standalone browser demo. It imports the built files from `./dist/` directly and is the simplest reference for plain HTML usage.

The Vite demo still exists for development:

```bash
npm install
npm run demo:dev
```

## Development

```bash
npm ci
npm run lint
npm run test
npm run test:types
npm run build
```

Live provider validation:

```bash
npm run validate:styles
```
