# vector-tiles-basemaps

Curated MapLibre basemap registry with public-style-first loading, local fallback support, filter helpers, and an optional basemap picker control.

## Goals

- Prefer public `styleUrl` entries whenever a provider exposes a usable style
- Allow local static style files only as a fallback when no practical public style URL is available
- Keep provider metadata machine-readable so host applications can filter basemaps
- Make MapLibre integration simple without forcing every project to rediscover basemap providers

## Included providers

### Stable remote styles

- `vectormap.light`
- `openfreemap.liberty`
- `openfreemap.bright`
- `openfreemap.positron`
- `versatiles.colorful`
- `versatiles.eclipse`
- `versatiles.graybeard`
- `versatiles.neutrino`
- `versatiles.shadow`
- `basemapde.color`
- `basemapde.relief`
- `basemapde.gray`
- `basemapworld.color`

### Restricted remote styles

- `swisstopo.basemap`
- `swisstopo.light`
- `swisstopo.imagery`

### Experimental remote styles

- `openmaptiles.osm-bright`
- `openmaptiles.positron`
- `openmaptiles.dark-matter`
- `openmaptiles.basic`

### Experimental local fallback styles

- `protomaps.light.de`
- `protomaps.light.en`
- `protomaps.dark.de`
- `protomaps.dark.en`
- `protomaps.data-viz-white.de`

## Package API

```js
import {
  listBasemaps,
  getBasemap,
  resolveBasemapStyle,
  loadBasemapStyle,
  applyBasemap,
  createBasemapControl,
} from "vector-tiles-basemaps";
```

### BasemapDefinition

```ts
type BasemapDefinition = {
  id: string
  name: string
  provider: string
  styleUrl?: string
  localStylePath?: string
  providerUrl: string
  usagePolicyUrl?: string
  attributionHtml?: string
  variant: "light" | "dark" | "relief" | "imagery" | "colorful" | "gray" | "white" | "black"
  coverage: "world" | "country" | "region"
  countries?: string[]
  previewUrl?: string
  status: "stable" | "experimental" | "restricted"
  sourceMode: "remote" | "local-fallback"
  lastVerifiedAt: string
}
```

## Installation

```bash
npm install vector-tiles-basemaps
```

If you want to use providers whose style documents reference PMTiles, include the `pmtiles` library in your application and pass it to `applyBasemap`.

```bash
npm install maplibre-gl pmtiles
```

## Basic usage

```js
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import {
  applyBasemap,
  createBasemapControl,
  listBasemaps,
} from "vector-tiles-basemaps";

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": "#f3f4f6" } }],
  },
  center: [8.5417, 47.3769],
  zoom: 7,
});

await applyBasemap(map, "vectormap.light", { maplibregl, pmtiles });

map.addControl(
  createBasemapControl({
    basemapIds: [
      "vectormap.light",
      "openfreemap.liberty",
      "versatiles.graybeard",
      "swisstopo.basemap",
      "protomaps.light.de",
    ],
    applyOptions: { maplibregl, pmtiles },
  }),
  "bottom-left",
);
```

## Filtering

```js
const swissMaps = listBasemaps({ country: "CH" });
const darkMaps = listBasemaps({ variant: "dark" });
const selectedMaps = listBasemaps({
  ids: ["vectormap.light", "openfreemap.liberty", "protomaps.light.de"],
});
```

## Public URL first, local fallback second

The registry follows one rule:

- use `styleUrl` when a provider exposes a practical public style URL
- use `localStylePath` only when there is no good external style URL for the same basemap

That is why the Protomaps styles currently stay in [`styles`](C:/Users/fabia/GitHub/vector-tiles-basemaps/styles) as local fallback assets, while most other providers are referenced remotely.

## Style verification

The repository includes two checks:

- `npm test` for local API behavior
- `npm run validate:styles` to verify local and remote style documents

The validation script checks:

- local fallback files exist and parse correctly
- remote style URLs are reachable
- loaded documents look like valid MapLibre styles

## Demo

[`index.html`](C:/Users/fabia/GitHub/vector-tiles-basemaps/index.html) is a static GitHub Pages demo that imports the module directly from source, applies a default basemap, and exposes the optional picker control.

## Notes on provider constraints

- `swisstopo.*` entries are marked `restricted` because usage conditions differ from fully open public world basemaps.
- `openmaptiles.*` entries are marked `experimental` because the public CDN styles are useful but should not be treated like the strongest long-term public production commitments.
- `protomaps.*` entries are marked `experimental` and `local-fallback` because the style JSONs are kept in this repository as the supported fallback path.
