import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  applyBasemap,
  BasemapControl,
  getBasemap,
  listBasemaps,
  registerPmtilesProtocol,
  type BasemapChangeEvent,
  type BasemapDefinition,
} from "vector-tiles-basemaps";
import "vector-tiles-basemaps/style.css";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app element.");
}

app.innerHTML = `
  <div class="demo-shell">
    <aside class="demo-sidebar">
      <div class="demo-title">
        <h1>vector-tiles-basemaps</h1>
        <p>Typed MapLibre basemap control with vector styles, provider metadata, thumbnails, and raster fallback examples.</p>
      </div>
      <section class="demo-panel">
        <h2>Current basemap</h2>
        <dl class="demo-meta" id="basemapMeta"></dl>
        <div class="demo-actions">
          <button type="button" data-basemap="vectormap.light">Vectormap</button>
          <button type="button" data-basemap="openfreemap.dark">OpenFreeMap Dark</button>
          <button type="button" data-basemap="versatiles.graybeard">VersaTiles</button>
          <button type="button" data-basemap="carto.light.raster">Raster</button>
        </div>
      </section>
      <pre class="demo-code"><code>map.addControl(new BasemapControl({
  basemapIds,
  initialBasemapId,
  onBasemapChange
}), "top-right");</code></pre>
    </aside>
    <main class="demo-map-shell">
      <div id="map"></div>
    </main>
  </div>
`;

const defaultBasemapId = "vectormap.light";
let currentBasemapId = defaultBasemapId;
const basemapIds = [
  "vectormap.light",
  "openfreemap.liberty",
  "openfreemap.dark",
  "versatiles.graybeard",
  "basemapworld.color",
  "swisstopo.basemap",
  "carto.light.raster",
];
const metaTarget = document.querySelector<HTMLElement>("#basemapMeta");

registerPmtilesProtocol(maplibregl, pmtiles);

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#e5edf3" },
      },
    ],
  },
  center: [8.7241, 47.4988],
  zoom: 10.8,
  pitch: 0,
  bearing: 0,
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

function renderBasemapMeta(basemap: BasemapDefinition): void {
  if (!metaTarget) {
    return;
  }

  metaTarget.replaceChildren();

  const rows: Array<[string, string]> = [
    ["Name", basemap.name],
    ["ID", basemap.id],
    ["Provider", basemap.provider],
    ["Type", basemap.sourceType],
    ["Coverage", basemap.coverage],
    ["License", basemap.license ?? "Provider terms"],
  ];

  for (const [term, value] of rows) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value ?? "";
    wrapper.append(dt, dd);
    metaTarget.appendChild(wrapper);
  }
}

function onBasemapChange(event: BasemapChangeEvent): void {
  currentBasemapId = event.basemap.id;
  renderBasemapMeta(event.basemap);
}

const defaultBasemap = getBasemap(defaultBasemapId);

if (defaultBasemap) {
  renderBasemapMeta(defaultBasemap);
}

await applyBasemap(map, defaultBasemapId, {
  repositionIfOutsideCoverage: true,
});

const basemapControl = new BasemapControl({
  basemapIds: listBasemaps({ ids: basemapIds }).map((definition) => definition.id),
  initialBasemapId: defaultBasemapId,
  groupBy: "provider",
  applyOptions: {
    repositionIfOutsideCoverage: true,
  },
  onBasemapChange,
  onBasemapError: (event) => {
    console.error(`Could not apply ${event.basemapId}`, event.error);
  },
});

map.addControl(basemapControl, "top-right");

document.querySelectorAll<HTMLButtonElement>("[data-basemap]").forEach((button) => {
  button.addEventListener("click", async () => {
    const basemapId = button.dataset.basemap;
    if (!basemapId) {
      return;
    }

    const result = await applyBasemap(map, basemapId, {
      previousBasemapId: currentBasemapId,
      repositionIfOutsideCoverage: true,
    });
    currentBasemapId = result.basemap.id;
    basemapControl.setActiveBasemap(result.basemap.id);
    renderBasemapMeta(result.basemap);
  });
});
