import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { getBasemap } from "./registry.js";
import type {
  ApplyBasemapOptions,
  ApplyBasemapResult,
  BasemapLoadOptions,
  BasemapStyleResult,
  BasemapView,
} from "./types.js";

const BASEMAPWORLD_VECTOR_LAYERS = new Set([
  "building",
  "housenumber",
  "landcover",
  "landuse",
  "mountain_peak",
  "park",
  "place",
  "poi",
  "transportation",
  "transportation_name",
  "water",
  "water_name",
  "waterway",
]);

function isAbsoluteUrl(value: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(value) || value.startsWith("//");
}

function absolutizeUrl(value: string | undefined, baseUrl: string | undefined): string | undefined {
  if (!value || !baseUrl) {
    return value;
  }

  if (isAbsoluteUrl(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  return new URL(value, baseUrl).href;
}

function cloneStyleDocument(styleDocument: StyleSpecification): StyleSpecification {
  return structuredClone(styleDocument);
}

function normalizeTiles(tiles: unknown, baseUrl: string | undefined): unknown {
  if (!Array.isArray(tiles)) {
    return tiles;
  }

  return tiles.map((tileUrl) => (typeof tileUrl === "string" ? absolutizeUrl(tileUrl, baseUrl) : tileUrl));
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) {
    return;
  }

  throw new DOMException("The basemap operation was aborted.", "AbortError");
}

export function validateStyleDocument(styleDocument: unknown, context = "style"): StyleSpecification {
  if (!styleDocument || typeof styleDocument !== "object" || Array.isArray(styleDocument)) {
    throw new Error(`${context} did not resolve to a JSON object.`);
  }

  const candidate = styleDocument as Partial<StyleSpecification>;

  if (candidate.version !== 8) {
    throw new Error(`${context} is not a MapLibre style version 8 document.`);
  }

  if (!candidate.sources || typeof candidate.sources !== "object" || Array.isArray(candidate.sources)) {
    throw new Error(`${context} is missing a sources object.`);
  }

  if (!Array.isArray(candidate.layers)) {
    throw new Error(`${context} is missing a layers array.`);
  }

  return styleDocument as StyleSpecification;
}

function normalizeStyleDocument(styleDocument: StyleSpecification, baseUrl: string | undefined): StyleSpecification {
  const normalized = cloneStyleDocument(styleDocument);
  validateStyleDocument(normalized, baseUrl ?? "style");

  if (typeof normalized.sprite === "string") {
    normalized.sprite = absolutizeUrl(normalized.sprite, baseUrl);
  }

  if (typeof normalized.glyphs === "string") {
    normalized.glyphs = absolutizeUrl(normalized.glyphs, baseUrl);
  }

  for (const source of Object.values(normalized.sources)) {
    if (!source || typeof source !== "object") {
      continue;
    }

    const mutableSource = source as {
      url?: unknown;
      tiles?: unknown;
      data?: unknown;
    };

    if (typeof mutableSource.url === "string") {
      mutableSource.url = absolutizeUrl(mutableSource.url, baseUrl);
    }

    if (Array.isArray(mutableSource.tiles)) {
      mutableSource.tiles = normalizeTiles(mutableSource.tiles, baseUrl);
    }

    if (typeof mutableSource.data === "string") {
      mutableSource.data = absolutizeUrl(mutableSource.data, baseUrl);
    }
  }

  return normalized;
}

async function loadJsonDocument(url: string, options: BasemapLoadOptions): Promise<unknown> {
  const fetcher = options.fetch ?? globalThis.fetch;

  throwIfAborted(options.signal);

  if (!fetcher) {
    throw new Error("No fetch implementation is available to load MapLibre style URLs.");
  }

  const response = await fetcher(url, { signal: options.signal });
  throwIfAborted(options.signal);

  if (!response.ok) {
    throw new Error(`Failed to load style document from ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function pruneKnownBrokenLayers(id: string, styleDocument: StyleSpecification): StyleSpecification {
  if (id !== "basemapworld.color") {
    return styleDocument;
  }

  styleDocument.layers = styleDocument.layers.filter((layer) => {
    const candidate = layer as { source?: unknown; "source-layer"?: unknown };

    if (candidate.source !== "smarttiles_wld") {
      return true;
    }

    if (typeof candidate["source-layer"] !== "string") {
      return true;
    }

    return BASEMAPWORLD_VECTOR_LAYERS.has(candidate["source-layer"]);
  });

  return styleDocument;
}

export function styleUsesProtocol(styleDocument: StyleSpecification, protocol: string): boolean {
  const protocolPrefix = `${protocol}://`;

  return Object.values(styleDocument.sources).some((source) => {
    if (!source || typeof source !== "object") {
      return false;
    }

    const candidate = source as { url?: unknown; tiles?: unknown };

    if (typeof candidate.url === "string" && candidate.url.startsWith(protocolPrefix)) {
      return true;
    }

    return Array.isArray(candidate.tiles) && candidate.tiles.some((tileUrl) => {
      return typeof tileUrl === "string" && tileUrl.startsWith(protocolPrefix);
    });
  });
}

export function styleUsesPmtiles(styleDocument: StyleSpecification): boolean {
  return styleUsesProtocol(styleDocument, "pmtiles");
}

export function resolveBasemapStyle(id: string, options: BasemapLoadOptions = {}): BasemapStyleResult {
  const definition = getBasemap(id, options.registry);

  if (!definition) {
    throw new Error(`Unknown basemap id "${id}".`);
  }

  const style = definition.style ?? definition.styleUrl;

  if (!style) {
    throw new Error(`Basemap "${id}" has no style.`);
  }

  return {
    id: definition.id,
    definition,
    style,
    url: typeof style === "string" ? style : undefined,
  };
}

export async function loadBasemapStyle(id: string, options: BasemapLoadOptions = {}): Promise<StyleSpecification> {
  throwIfAborted(options.signal);

  const { style, url } = resolveBasemapStyle(id, options);

  if (typeof style === "string") {
    const styleDocument = await loadJsonDocument(style, options);
    throwIfAborted(options.signal);
    const validated = validateStyleDocument(styleDocument, style);
    return pruneKnownBrokenLayers(id, normalizeStyleDocument(validated, style));
  }

  throwIfAborted(options.signal);
  const validated = validateStyleDocument(style, id);
  return pruneKnownBrokenLayers(id, normalizeStyleDocument(validated, url));
}

function snapshotView(map: MapLibreMap): Required<BasemapView> {
  const center = map.getCenter();

  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function pointInBounds(center: { lng: number; lat: number }, bounds: readonly [number, number, number, number] | undefined): boolean {
  if (!bounds) {
    return true;
  }

  const [west, south, east, north] = bounds;
  return center.lng >= west && center.lng <= east && center.lat >= south && center.lat <= north;
}

function waitForStyleLoad(map: MapLibreMap, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    const eventedMap = map as MapLibreMap & {
      off?: (eventName: string, listener: (...args: unknown[]) => void) => MapLibreMap;
    };

    const cleanup = () => {
      signal?.removeEventListener("abort", handleAbort);
      eventedMap.off?.("style.load", handleStyleLoad);
      eventedMap.off?.("error", handleError);
    };
    const handleStyleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = (event: unknown) => {
      cleanup();
      const error = event && typeof event === "object" && "error" in event
        ? (event as { error: unknown }).error
        : event;
      reject(error instanceof Error ? error : new Error("MapLibre emitted an error while loading the basemap style."));
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException("The basemap operation was aborted.", "AbortError"));
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }

    map.once("style.load", handleStyleLoad);
    map.once("error", handleError);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export async function applyBasemap<TSnapshot = unknown>(
  map: MapLibreMap,
  id: string,
  options: ApplyBasemapOptions<TSnapshot> = {},
): Promise<ApplyBasemapResult> {
  const basemap = getBasemap(id, options.registry);
  const previousBasemap = options.previousBasemapId
    ? getBasemap(options.previousBasemapId, options.registry)
    : null;

  try {
    throwIfAborted(options.signal);

    if (!basemap) {
      throw new Error(`Unknown basemap id "${id}".`);
    }

    const styleDocument = await loadBasemapStyle(id, options);
    throwIfAborted(options.signal);
    const preserveView = options.preserveView !== false;
    const currentView = preserveView ? snapshotView(map) : null;
    const context = {
      map,
      basemap,
      previousBasemap,
    };
    const overlaySnapshot = options.captureOverlays
      ? await options.captureOverlays(context)
      : undefined;

    throwIfAborted(options.signal);
    map.setStyle(styleDocument, { diff: options.diff ?? false });

    if (currentView) {
      map.jumpTo(currentView);
    }

    if (options.repositionIfOutsideCoverage && basemap.bounds && basemap.defaultView) {
      const center = map.getCenter();

      if (!pointInBounds(center, basemap.bounds)) {
        map.jumpTo({
          center: basemap.defaultView.center,
          zoom: basemap.defaultView.zoom,
          bearing: basemap.defaultView.bearing ?? 0,
          pitch: basemap.defaultView.pitch ?? 0,
        });
      }
    }

    if (options.restoreOverlays) {
      await waitForStyleLoad(map, options.signal);
      throwIfAborted(options.signal);
      await options.restoreOverlays(overlaySnapshot as TSnapshot, context);
    }

    return {
      basemap,
      previousBasemap,
      style: styleDocument,
    };
  } catch (error) {
    if (!isAbortError(error)) {
      options.onBasemapError?.({
        map,
        basemap: basemap ?? undefined,
        basemapId: id,
        error,
      });
    }
    throw error;
  }
}
