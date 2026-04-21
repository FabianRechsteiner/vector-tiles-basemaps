import {
  basemapRegistry,
  listBasemaps,
  getBasemap,
  resolveBasemapStyle,
  loadBasemapStyle,
  applyBasemap,
  createBasemapControl,
} from "../src/index.js";

const browserApi = {
  basemapRegistry,
  listBasemaps,
  getBasemap,
  resolveBasemapStyle,
  loadBasemapStyle,
  applyBasemap,
  createBasemapControl,
};

globalThis.VectorTilesBasemaps = browserApi;
globalThis.vector_tiles_basemaps = Object.fromEntries(
  basemapRegistry.map((definition) => [definition.id, definition]),
);
