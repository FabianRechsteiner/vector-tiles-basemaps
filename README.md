# vector-tiles-basemaps

Ein schlankes MapLibre-Modul mit einer kuratierten Sammlung oeffentlich nutzbarer Vector-Tile-Basemaps ohne API-Key-Pflicht.

Das Modul liefert:

- einen Basemap-Katalog
- Filterfunktionen
- einen Helper zum Style-Wechsel in MapLibre
- einen optionalen kompakten Basemap-Switcher

Die Basemaps werden bewusst nur ueber oeffentliche `styleUrl` eingebunden. Statische Style-Kopien und Fallback-Varianten sind nicht Teil des Produktcodes.

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

## Basisnutzung

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
  center: [8.5417, 47.3769],
  zoom: 7,
});

await applyBasemap(map, "vectormap.light", { maplibregl, pmtiles });

map.addControl(
  createBasemapControl({
    basemapIds: [
      "vectormap.light",
      "openfreemap.liberty",
      "openfreemap.dark",
      "versatiles.graybeard",
      "swisstopo.basemap",
    ],
    applyOptions: { maplibregl, pmtiles },
  }),
  "bottom-left",
);
```

## Filterung

```js
const swissMaps = listBasemaps({ country: "CH" });
const darkMaps = listBasemaps({ variant: "dark" });
const selectedMaps = listBasemaps({
  ids: ["vectormap.light", "openfreemap.fiord", "basemapworld.color"],
});
```

## Enthaltene Provider

Stabil:

- `vectormap.light`
- `openfreemap.liberty`
- `openfreemap.bright`
- `openfreemap.positron`
- `versatiles.colorful`
- `versatiles.eclipse`
- `versatiles.graybeard`
- `versatiles.neutrino`
- `versatiles.shadow`
- `basemapworld.color`

Eingeschraenkt:

- `swisstopo.basemap`
- `swisstopo.light`
- `swisstopo.imagery`

Experimentell:

- `openfreemap.dark`
- `openfreemap.fiord`

## Nicht aufgenommen

- ArcGIS Basemap Styles und Open Basemap Styles:
  sie verlangen laut Esri-Doku einen Token oder API-Key und fallen damit aus dem no-key-Scope dieses Projekts
- Protomaps:
  die gehostete Style-Nutzung ist nicht als stabiler no-key-Provider fuer dieses Projekt geeignet und wurde deshalb entfernt

## Preview-Bilder

Die Erzeugung von PNG-Vorschaubildern ist bewusst nicht Teil des Kernmoduls. Dafuer gibt es das separate Zusatzverzeichnis [`preview-generator`](C:/Users/fabia/GitHub/vector-tiles-basemaps/preview-generator/README.md).

Dort ist dokumentiert:

- wie die Preview-Bilder erzeugt werden
- welcher Befehl verwendet wird
- welche Parameter fuer Koordinaten, Zoom, Groesse und Basemap-IDs verfuegbar sind

## Demo

[`index.html`](C:/Users/fabia/GitHub/vector-tiles-basemaps/index.html) zeigt die Nutzung des Moduls direkt im Browser mit dem optionalen Basemap-Switcher.
