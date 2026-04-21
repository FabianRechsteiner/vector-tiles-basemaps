import { getBasemap } from "./basemaps.js";

const PMTILES_PROTOCOL_KEY = "__vectorTilesBasemapsPmtilesProtocol";

function isAbsoluteUrl(value) {
  return /^[a-z][a-z\d+\-.]*:/i.test(value) || value.startsWith("//");
}

function absolutizeUrl(value, baseUrl) {
  if (!value) {
    return value;
  }

  if (value.startsWith("pmtiles://")) {
    const innerUrl = value.slice("pmtiles://".length);
    return `pmtiles://${absolutizeUrl(innerUrl, baseUrl)}`;
  }

  if (isAbsoluteUrl(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  return new URL(value, baseUrl).href;
}

function normalizeSourceUrl(value, baseUrl) {
  if (!value) {
    return value;
  }

  if (value.startsWith("pmtiles://")) {
    const innerUrl = value.slice("pmtiles://".length);
    return `pmtiles://${absolutizeUrl(innerUrl, baseUrl)}`;
  }

  const absoluteUrl = absolutizeUrl(value, baseUrl);

  if (absoluteUrl.includes(".pmtiles")) {
    return `pmtiles://${absoluteUrl}`;
  }

  return absoluteUrl;
}

function normalizeTiles(tiles, baseUrl) {
  if (!Array.isArray(tiles)) {
    return tiles;
  }

  return tiles.map((tileUrl) => normalizeSourceUrl(tileUrl, baseUrl));
}

export function validateStyleDocument(styleDocument, context = "style") {
  if (!styleDocument || typeof styleDocument !== "object" || Array.isArray(styleDocument)) {
    throw new Error(`${context} did not resolve to a JSON object.`);
  }

  if (styleDocument.version !== 8) {
    throw new Error(`${context} is not a MapLibre style version 8 document.`);
  }

  if (!styleDocument.sources || typeof styleDocument.sources !== "object") {
    throw new Error(`${context} is missing a sources object.`);
  }

  if (!Array.isArray(styleDocument.layers)) {
    throw new Error(`${context} is missing a layers array.`);
  }

  return styleDocument;
}

function normalizeStyleDocument(styleDocument, baseUrl) {
  validateStyleDocument(styleDocument, baseUrl);

  if (typeof styleDocument.sprite === "string") {
    styleDocument.sprite = absolutizeUrl(styleDocument.sprite, baseUrl);
  }

  if (typeof styleDocument.glyphs === "string") {
    styleDocument.glyphs = absolutizeUrl(styleDocument.glyphs, baseUrl);
  }

  for (const source of Object.values(styleDocument.sources)) {
    if (!source || typeof source !== "object") {
      continue;
    }

    if (typeof source.url === "string") {
      source.url = normalizeSourceUrl(source.url, baseUrl);
    }

    if (Array.isArray(source.tiles)) {
      source.tiles = normalizeTiles(source.tiles, baseUrl);
    }

    if (typeof source.data === "string") {
      source.data = absolutizeUrl(source.data, baseUrl);
    }
  }

  return styleDocument;
}

async function loadJsonFromFileUrl(fileUrl) {
  const { readFile } = await import("node:fs/promises");
  const contents = await readFile(new URL(fileUrl), "utf8");
  return JSON.parse(contents);
}

async function loadJsonDocument(url) {
  if (url.startsWith("file:")) {
    return loadJsonFromFileUrl(url);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load style document from ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function styleUsesPmtiles(styleDocument) {
  return Object.values(styleDocument.sources).some((source) => {
    if (!source || typeof source !== "object") {
      return false;
    }

    if (typeof source.url === "string" && source.url.startsWith("pmtiles://")) {
      return true;
    }

    return Array.isArray(source.tiles) && source.tiles.some((tileUrl) => typeof tileUrl === "string" && tileUrl.startsWith("pmtiles://"));
  });
}

function resolvePmtilesLibrary(explicitPmtiles) {
  return explicitPmtiles ?? globalThis.pmtiles ?? null;
}

function ensurePmtilesProtocol(maplibregl, pmtilesLibrary) {
  if (!pmtilesLibrary?.Protocol) {
    throw new Error("This basemap requires PMTiles support. Pass a pmtiles library instance to applyBasemap().");
  }

  if (!maplibregl?.addProtocol) {
    throw new Error("MapLibre protocol registration is unavailable. Pass the maplibregl module to applyBasemap().");
  }

  if (maplibregl[PMTILES_PROTOCOL_KEY]) {
    return;
  }

  const protocol = new pmtilesLibrary.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  maplibregl[PMTILES_PROTOCOL_KEY] = true;
}

export function resolveBasemapStyle(id) {
  const definition = getBasemap(id);

  if (!definition) {
    throw new Error(`Unknown basemap id "${id}".`);
  }

  const url = definition.styleUrl ?? definition.localStylePath;

  if (!url) {
    throw new Error(`Basemap "${id}" has neither styleUrl nor localStylePath.`);
  }

  return {
    id: definition.id,
    sourceMode: definition.sourceMode,
    url,
  };
}

export async function loadBasemapStyle(id) {
  const { url } = resolveBasemapStyle(id);
  const styleDocument = await loadJsonDocument(url);
  return normalizeStyleDocument(styleDocument, url);
}

function snapshotView(map) {
  return {
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

export async function applyBasemap(map, id, options = {}) {
  const styleDocument = await loadBasemapStyle(id);

  if (styleUsesPmtiles(styleDocument)) {
    ensurePmtilesProtocol(options.maplibregl ?? globalThis.maplibregl, resolvePmtilesLibrary(options.pmtiles));
  }

  const preserveView = options.preserveView !== false;
  const currentView = preserveView ? snapshotView(map) : null;

  map.setStyle(styleDocument, { diff: false });

  if (currentView) {
    map.jumpTo(currentView);
  }

  return getBasemap(id);
}
