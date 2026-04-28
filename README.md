# vector-tiles-basemaps

Typed MapLibre GL JS basemap control for vector styles, provider registries, PMTiles-ready styles, preview images, and raster fallback examples.

This repository publishes a browser-ready static API. Consumers can use the control directly from hosted files without installing this package with npm.

Demo:

- GitHub Pages: <http://fabianrechsteiner.github.io/vector-tiles-basemaps/>
- Custom domain: <https://vectormap.ch/vector-tiles-basemaps/>

Hosted files:

- JavaScript API: `https://vectormap.ch/vector-tiles-basemaps/dist/index.js`
- CSS: `https://vectormap.ch/vector-tiles-basemaps/dist/style.css`
- Preview images: `https://vectormap.ch/vector-tiles-basemaps/dist/previews/<basemap-id>.png`

## Requirements

To use the basemap control in a browser page or web application, you need:

- MapLibre GL JS `>=3.0.0 <6.0.0`
- MapLibre GL JS CSS loaded once on the page
- `vector-tiles-basemaps/dist/style.css` loaded once on the page
- a MapLibre map instance
- network access to the configured basemap style URLs, tile URLs, glyph URLs, sprite URLs, and preview images
- a modern browser with ES module support

Optional requirements:

- `pmtiles` `>=3.0.0` when using basemaps whose styles reference `pmtiles://` sources
- an import map or bundler alias when loading `maplibre-gl` and `pmtiles` as browser ES modules

For local development in this repository, you also need:

- Node.js `>=20`
- npm
- a Chromium-based browser when regenerating preview images

## Quick Start Without npm

Use this when the consuming page should load the library directly from static files.

```html
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css">
<link rel="stylesheet" href="https://vectormap.ch/vector-tiles-basemaps/dist/style.css">

<div id="map" style="height: 100vh"></div>

<script type="importmap">
  {
    "imports": {
      "maplibre-gl": "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/+esm",
      "pmtiles": "https://cdn.jsdelivr.net/npm/pmtiles@4.4.1/+esm"
    }
  }
</script>

<script type="module">
  import maplibregl from "maplibre-gl";
  import * as pmtiles from "pmtiles";
  import {
    applyBasemap,
    createBasemapControl,
    listBasemaps,
    registerPmtilesProtocol
  } from "https://vectormap.ch/vector-tiles-basemaps/dist/index.js";

  registerPmtilesProtocol(maplibregl, pmtiles);

  const map = new maplibregl.Map({
    container: "map",
    style: { version: 8, sources: {}, layers: [] },
    center: [8.7241, 47.4988],
    zoom: 10.8
  });

  const initialBasemapId = "vectormap.light";

  await applyBasemap(map, initialBasemapId, {
    repositionIfOutsideCoverage: true
  });

  map.addControl(
    createBasemapControl({
      basemapIds: listBasemaps({ sourceType: ["vector", "hybrid"] }).map((basemap) => basemap.id),
      initialBasemapId,
      position: "bottom-left",
      applyOptions: {
        repositionIfOutsideCoverage: true
      }
    })
  );
</script>
```

## Static Hosting

The generated static API can be served from any static hosting provider.

The published static output must include:

- `dist/index.js`
- `dist/style.css`
- `dist/previews/*.png`

The demo deployment also includes:

- `index.html`
- bundled demo assets
- `.nojekyll`

GitHub Pages can serve this output from a public repository. The included workflow `.github/workflows/static.yml` builds the library, builds the demo, copies `dist/` into the Pages artifact, and deploys the result.

For a public repository, GitHub Pages and standard GitHub-hosted Actions runners can be used with GitHub Free.

## Public API

Common exports:

```ts
import {
  BasemapControl,
  applyBasemap,
  createBasemapControl,
  createBasemapRegistry,
  getBasemap,
  listBasemaps,
  loadBasemapStyle,
  registerPmtilesProtocol
} from "https://vectormap.ch/vector-tiles-basemaps/dist/index.js";
```

### `BasemapControl`

The main MapLibre control. It can be added with `map.addControl(...)`.

```ts
map.addControl(
  new BasemapControl({
    basemapIds: ["openfreemap.liberty", "openfreemap.dark", "versatiles.graybeard"],
    initialBasemapId: "openfreemap.liberty",
    groupBy: "provider",
    position: "bottom-left",
    onBasemapChange(event) {
      console.log(event.basemap.id);
    }
  })
);
```

Important options:

- `basemapIds`: limit the control to specific basemaps
- `filters`: filter the default registry
- `registry`: use a custom basemap registry
- `position`: default MapLibre control position
- `initialBasemapId`: initially selected basemap
- `groupBy`: `"group" | "provider" | "variant" | "sourceType"`
- `onBasemapChange`: called after a committed basemap switch
- `onBasemapError`: called when loading or applying a basemap fails

Preview behavior: hovering or focusing a basemap option temporarily applies that basemap to the map. When the pointer leaves the panel, the last committed basemap is restored.

### `applyBasemap`

Use this when only the switching logic is needed, without the UI control.

```ts
await applyBasemap(map, "openfreemap.dark", {
  preserveView: true,
  repositionIfOutsideCoverage: true
});
```

The style is loaded and validated before `map.setStyle(...)` is called. A broken remote style therefore does not immediately wipe the current map.

### Custom Basemaps

```ts
import {
  applyBasemap,
  createBasemapControl,
  createBasemapRegistry
} from "https://vectormap.ch/vector-tiles-basemaps/dist/index.js";

const registry = createBasemapRegistry([
  {
    id: "custom.light",
    name: "Custom Light",
    provider: "custom",
    group: "general",
    style: "https://example.com/style.json",
    variant: "light",
    coverage: "world",
    sourceType: "vector"
  }
]);

await applyBasemap(map, "custom.light", { registry });
map.addControl(createBasemapControl({ registry, position: "bottom-left" }));
```

### PMTiles

The package does not register PMTiles globally by itself. Register it explicitly when a basemap uses `pmtiles://`.

```ts
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import { registerPmtilesProtocol } from "https://vectormap.ch/vector-tiles-basemaps/dist/index.js";

const unregisterPmtiles = registerPmtilesProtocol(maplibregl, pmtiles);
```

## npm Usage

Use npm when the consuming app uses Vite, Webpack, Rollup, Astro, React, Vue, Svelte, or another bundler.

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
  zoom: 10.8
});

await applyBasemap(map, "openfreemap.liberty");

map.addControl(
  new BasemapControl({
    basemapIds: ["openfreemap.liberty", "openfreemap.dark", "versatiles.graybeard"],
    position: "bottom-left"
  })
);
```

## Tests

Install dependencies once:

```bash
npm ci
```

Run the normal validation suite:

```bash
npm run lint
npm run test
npm run test:types
npm run build
npm run demo:build
```

Optional live provider validation:

```bash
npm run validate:styles
```

`validate:styles` loads configured remote style documents. It can fail if a provider is offline, rate-limited, or changes its style endpoint.

## Regenerating Preview Images

Preview images are stored in `preview-generator/generated/` and committed to the repository. The build copies them to `dist/previews/`, where the static API uses them.

Generate all previews for the default Winterthur view:

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

Generate previews with another coordinate and zoom:

```bash
npm run generate:previews -- --lng=8.5417 --lat=47.3769 --zoom=13
```

Generate only selected basemaps:

```bash
npm run generate:previews -- --ids=vectormap.light,openfreemap.dark --lng=8.7147 --lat=47.4951 --zoom=12
```

Available parameters:

- `--lng=<number>` center longitude
- `--lat=<number>` center latitude
- `--zoom=<number>` zoom level
- `--bearing=<number>` optional, default `0`
- `--pitch=<number>` optional, default `0`
- `--width=<number>` optional, default `160`
- `--height=<number>` optional, default `160`
- `--scale=<number>` optional, default `2`
- `--ids=<id1,id2,...>` optional list of basemap ids

The command runs `npm run build` first because the preview renderer imports the built ESM library from `dist/`.

## Repository Structure

Keep these directories in the repository:

- `src/`: library source code
- `test/`: runtime and DOM tests
- `test-d/`: TypeScript API tests with `tsd`
- `demo/`: Vite demo source
- `preview-generator/`: preview rendering tool
- `preview-generator/generated/`: committed preview PNGs used by the static build

Generated or local-only directories:

- `dist/`: generated library build, ignored by Git
- `demo-dist/`: generated Pages/demo build, ignored by Git
- `node_modules/`: local dependencies, ignored by Git
- `coverage/`: local test coverage output, ignored by Git

`.changeset/` is only needed when npm publishing is used later. The release workflow is manual, so normal pushes only run CI and Pages deployment.

## Development

Useful commands:

```bash
npm run build
npm run demo:dev
npm run demo:build
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

The top-level `index.html` is the standalone static demo. It imports the built files from `./dist/` and is the simplest reference for plain browser usage.
