import type {
  ControlPosition,
  Map as MapLibreMap,
  StyleSpecification,
} from "maplibre-gl";

export type OneOrMany<T> = T | readonly T[];

export type BasemapVariant =
  | "light"
  | "dark"
  | "relief"
  | "imagery"
  | "colorful"
  | "gray"
  | "white"
  | "black";

export type BasemapCoverage = "world" | "country" | "region";
export type BasemapSourceType = "vector" | "raster" | "hybrid";
export type BasemapProtocol = "pmtiles";

export interface BasemapView {
  center: [number, number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface BasemapProvider {
  id: string;
  name: string;
  url: string;
  usagePolicyUrl?: string;
  license?: string;
  attributionHtml?: string;
}

export interface BasemapGroup {
  id: string;
  label: string;
  description?: string;
}

export interface RasterFallbackDefinition {
  tiles: readonly string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  attributionHtml?: string;
}

export interface BasemapDefinition {
  id: string;
  name: string;
  provider: string;
  group: string;
  style: string | StyleSpecification;
  /** @deprecated Use `style` instead. */
  styleUrl?: string;
  providerUrl?: string;
  usagePolicyUrl?: string;
  attributionHtml?: string;
  license?: string;
  variant: BasemapVariant;
  coverage: BasemapCoverage;
  sourceType: BasemapSourceType;
  countries?: readonly string[];
  bounds?: readonly [number, number, number, number];
  defaultView?: BasemapView;
  previewUrl?: string;
  rasterFallback?: RasterFallbackDefinition;
  protocols?: readonly BasemapProtocol[];
  lastVerifiedAt?: string;
}

export interface BasemapRegistryFilters {
  provider?: OneOrMany<string>;
  group?: OneOrMany<string>;
  variant?: OneOrMany<BasemapVariant>;
  coverage?: OneOrMany<BasemapCoverage>;
  sourceType?: OneOrMany<BasemapSourceType>;
  country?: OneOrMany<string>;
  ids?: OneOrMany<string>;
  excludeIds?: OneOrMany<string>;
}

export interface BasemapRegistry {
  readonly definitions: readonly BasemapDefinition[];
  readonly providers: readonly BasemapProvider[];
  readonly groups: readonly BasemapGroup[];
  get(id: string): BasemapDefinition | null;
  getProvider(id: string): BasemapProvider | null;
  getGroup(id: string): BasemapGroup | null;
  list(filters?: BasemapRegistryFilters): BasemapDefinition[];
}

export interface BasemapStyleResult {
  id: string;
  definition: BasemapDefinition;
  style: string | StyleSpecification;
  url?: string;
}

export interface BasemapLoadOptions {
  fetch?: typeof fetch;
  signal?: AbortSignal;
  registry?: BasemapRegistry;
}

export interface BasemapApplyContext {
  map: MapLibreMap;
  basemap: BasemapDefinition;
  previousBasemap: BasemapDefinition | null;
}

export type CaptureOverlaysCallback<TSnapshot = unknown> = (
  context: BasemapApplyContext,
) => TSnapshot | Promise<TSnapshot>;

export type RestoreOverlaysCallback<TSnapshot = unknown> = (
  snapshot: TSnapshot,
  context: BasemapApplyContext,
) => void | Promise<void>;

export interface BasemapErrorEvent {
  map?: MapLibreMap;
  basemap?: BasemapDefinition;
  basemapId: string;
  error: unknown;
}

export interface BasemapChangeEvent {
  map: MapLibreMap;
  basemap: BasemapDefinition;
  previousBasemap: BasemapDefinition | null;
  style: StyleSpecification;
}

export interface ApplyBasemapOptions<TSnapshot = unknown> extends BasemapLoadOptions {
  previousBasemapId?: string;
  preserveView?: boolean;
  repositionIfOutsideCoverage?: boolean;
  diff?: boolean;
  captureOverlays?: CaptureOverlaysCallback<TSnapshot>;
  restoreOverlays?: RestoreOverlaysCallback<TSnapshot>;
  onBasemapError?: (event: BasemapErrorEvent) => void;
}

export interface ApplyBasemapResult {
  basemap: BasemapDefinition;
  previousBasemap: BasemapDefinition | null;
  style: StyleSpecification;
}

export interface BasemapControlOptions<TSnapshot = unknown> {
  basemapIds?: readonly string[];
  filters?: BasemapRegistryFilters;
  registry?: BasemapRegistry;
  initialBasemapId?: string;
  position?: ControlPosition;
  /** @deprecated Use `position` instead. */
  defaultPosition?: ControlPosition;
  groupBy?: "group" | "provider" | "variant" | "sourceType";
  label?: string;
  applyOptions?: ApplyBasemapOptions<TSnapshot>;
  onBasemapChange?: (event: BasemapChangeEvent) => void;
  /** @deprecated Use `onBasemapChange` instead. */
  onChange?: (basemap: BasemapDefinition) => void;
  onPreview?: (basemap: BasemapDefinition | null) => void;
  onBasemapError?: (event: BasemapErrorEvent) => void;
}

export interface PmtilesProtocol {
  tile: unknown;
}

export interface PmtilesLibrary {
  Protocol: new () => PmtilesProtocol;
}

export interface MapLibreProtocolHost {
  addProtocol(name: string, handler: unknown): void;
  removeProtocol?(name: string): void;
}
