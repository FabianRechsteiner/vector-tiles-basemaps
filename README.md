# vector-tiles-basemaps

Lightweight MapLibre basemap registry for publicly usable vector tile styles without required API keys.

It provides:

- a curated basemap catalog
- simple filter helpers
- a style switch helper for MapLibre
- an optional compact basemap picker

## Installation

```bash
npm install vector-tiles-basemaps
npm install maplibre-gl
npm install pmtiles
```

## API

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

## BasemapDefinition

```ts
type BasemapDefinition = {
  id: string
  name: string
  provider: string
  styleUrl: string
  providerUrl: string
  usagePolicyUrl?: string
  attributionHtml?: string
  variant: "light" | "dark" | "relief" | "imagery" | "colorful" | "gray" | "white" | "black"
  coverage: "world" | "country" | "region"
  countries?: string[]
  previewUrl?: string
  lastVerifiedAt: string
}
```

## Usage

```js
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import {
  applyBasemap,
  createBasemapControl,
} from "vector-tiles-basemaps";

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#f3f4f6" }
      }
    ]
  },
  center: [8.7241, 47.4988],
  zoom: 10.8,
});

await applyBasemap(map, "vectormap.light", { maplibregl, pmtiles });

map.addControl(
  createBasemapControl({
    basemapIds: [
      "vectormap.light",
      "openfreemap.dark",
      "versatiles.graybeard",
      "basemapworld.color",
      "swisstopo.basemap",
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
  ids: ["vectormap.light", "openfreemap.fiord", "basemapworld.color"],
});
```

## Providers

- `vectormap.light`
- `openfreemap.liberty`
- `openfreemap.bright`
- `openfreemap.positron`
- `openfreemap.dark`
- `openfreemap.fiord`
- `versatiles.colorful`
- `versatiles.eclipse`
- `versatiles.graybeard`
- `versatiles.neutrino`
- `versatiles.shadow`
- `basemapworld.color`
- `swisstopo.basemap`
- `swisstopo.light`
- `swisstopo.imagery`

## Preview Images

Preview image generation is documented separately in [`preview-generator/README.md`](C:/Users/fabia/GitHub/vector-tiles-basemaps/preview-generator/README.md).

## Demo

The static demo lives in [`index.html`](C:/Users/fabia/GitHub/vector-tiles-basemaps/index.html).
