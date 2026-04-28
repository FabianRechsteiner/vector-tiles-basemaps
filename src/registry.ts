import type { StyleSpecification } from "maplibre-gl";
import type {
  BasemapDefinition,
  BasemapGroup,
  BasemapProvider,
  BasemapRegistry,
  BasemapRegistryFilters,
  BasemapView,
  OneOrMany,
} from "./types.js";

const VERIFIED_AT = "2026-04-21";

const WINTERTHUR_PREVIEW_VIEW: Readonly<BasemapView> = Object.freeze({
  center: [8.7147, 47.4951] as [number, number],
  zoom: 12,
  bearing: 0,
  pitch: 0,
});

const GENERATED_PREVIEW_BASE_URL =
  "https://raw.githubusercontent.com/FabianRechsteiner/vector-tiles-basemaps/master/preview-generator/generated";

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }

  return value;
}

function assetUrl(relativePath: string): string {
  return new URL(relativePath, import.meta.url).href;
}

function generatedPreviewUrl(id: string): string {
  return assetUrl(`../dist/previews/${id}.png`);
}

const previewUrls: Record<string, string> = Object.fromEntries(
  [
    "basemapworld.color",
    "openfreemap.bright",
    "openfreemap.dark",
    "openfreemap.fiord",
    "openfreemap.liberty",
    "openfreemap.positron",
    "swisstopo.basemap",
    "swisstopo.imagery",
    "swisstopo.light",
    "vectormap.light",
    "versatiles.colorful",
    "versatiles.eclipse",
    "versatiles.graybeard",
    "versatiles.neutrino",
    "versatiles.shadow",
  ].map((id) => [id, `${GENERATED_PREVIEW_BASE_URL}/${id}.png`]),
);

const cartoRasterStyle: StyleSpecification = {
  version: 8,
  name: "CARTO Light Raster",
  sources: {
    "carto-light": {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-light",
      type: "raster",
      source: "carto-light",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const providerRegistry = deepFreeze([
  {
    id: "vectormap",
    name: "vectormap",
    url: "https://vectormap.ch/maps.html",
    usagePolicyUrl: "https://vectormap.ch/maps.html",
    license: "Provider terms",
  },
  {
    id: "openfreemap",
    name: "OpenFreeMap",
    url: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
  },
  {
    id: "versatiles",
    name: "VersaTiles",
    url: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
  },
  {
    id: "basemapworld",
    name: "basemap.world",
    url: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    license: "Datenlizenz Deutschland",
  },
  {
    id: "swisstopo",
    name: "swisstopo",
    url: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    license: "Swiss federal geodata terms",
  },
  {
    id: "carto",
    name: "CARTO",
    url: "https://carto.com/basemaps",
    usagePolicyUrl: "https://carto.com/attributions",
    license: "CARTO and OpenStreetMap attribution required",
    attributionHtml:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
] satisfies readonly BasemapProvider[]);

export const basemapGroups = deepFreeze([
  {
    id: "general",
    label: "General",
    description: "Neutral street and place reference maps.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Dark basemaps for high-contrast overlays.",
  },
  {
    id: "regional",
    label: "Regional",
    description: "Country or region specific official basemaps.",
  },
  {
    id: "imagery",
    label: "Imagery",
    description: "Aerial, satellite, or hybrid imagery basemaps.",
  },
  {
    id: "raster",
    label: "Raster",
    description: "Raster comparison and fallback basemaps.",
  },
] satisfies readonly BasemapGroup[]);

const defaultDefinitions = deepFreeze([
  {
    id: "vectormap.light",
    name: "Vectormap Light",
    provider: "vectormap",
    group: "regional",
    style: "https://vectormap.ch/styles/ch.vectormap.lightbasemap.json",
    styleUrl: "https://vectormap.ch/styles/ch.vectormap.lightbasemap.json",
    providerUrl: "https://vectormap.ch/maps.html",
    usagePolicyUrl: "https://vectormap.ch/maps.html",
    license: "Provider terms",
    variant: "light",
    coverage: "country",
    sourceType: "vector",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: previewUrls["vectormap.light"],
    protocols: ["pmtiles"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.liberty",
    name: "OpenFreeMap Liberty",
    provider: "openfreemap",
    group: "general",
    style: "https://tiles.openfreemap.org/styles/liberty",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    variant: "light",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["openfreemap.liberty"],
    rasterFallback: {
      tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attributionHtml:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.bright",
    name: "OpenFreeMap Bright",
    provider: "openfreemap",
    group: "general",
    style: "https://tiles.openfreemap.org/styles/bright",
    styleUrl: "https://tiles.openfreemap.org/styles/bright",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    variant: "colorful",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["openfreemap.bright"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.positron",
    name: "OpenFreeMap Positron",
    provider: "openfreemap",
    group: "general",
    style: "https://tiles.openfreemap.org/styles/positron",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    variant: "gray",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["openfreemap.positron"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.dark",
    name: "OpenFreeMap Dark",
    provider: "openfreemap",
    group: "dark",
    style: "https://tiles.openfreemap.org/styles/dark",
    styleUrl: "https://tiles.openfreemap.org/styles/dark",
    providerUrl: "https://github.com/hyperknot/openfreemap-styles",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    variant: "dark",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["openfreemap.dark"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.fiord",
    name: "OpenFreeMap Fiord",
    provider: "openfreemap",
    group: "dark",
    style: "https://tiles.openfreemap.org/styles/fiord",
    styleUrl: "https://tiles.openfreemap.org/styles/fiord",
    providerUrl: "https://github.com/hyperknot/openfreemap-styles",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    license: "OpenMapTiles and OpenStreetMap attribution required",
    variant: "dark",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["openfreemap.fiord"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.colorful",
    name: "VersaTiles Colorful",
    provider: "versatiles",
    group: "general",
    style: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
    styleUrl: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
    variant: "colorful",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["versatiles.colorful"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.eclipse",
    name: "VersaTiles Eclipse",
    provider: "versatiles",
    group: "dark",
    style: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
    styleUrl: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
    variant: "dark",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["versatiles.eclipse"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.graybeard",
    name: "VersaTiles Graybeard",
    provider: "versatiles",
    group: "general",
    style: "https://tiles.versatiles.org/assets/styles/graybeard/style.json",
    styleUrl: "https://tiles.versatiles.org/assets/styles/graybeard/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
    variant: "gray",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["versatiles.graybeard"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.neutrino",
    name: "VersaTiles Neutrino",
    provider: "versatiles",
    group: "general",
    style: "https://tiles.versatiles.org/assets/styles/neutrino/style.json",
    styleUrl: "https://tiles.versatiles.org/assets/styles/neutrino/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
    variant: "light",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["versatiles.neutrino"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.shadow",
    name: "VersaTiles Shadow",
    provider: "versatiles",
    group: "dark",
    style: "https://tiles.versatiles.org/assets/styles/shadow/style.json",
    styleUrl: "https://tiles.versatiles.org/assets/styles/shadow/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    license: "Provider terms and OpenStreetMap attribution required",
    variant: "dark",
    coverage: "world",
    sourceType: "vector",
    previewUrl: previewUrls["versatiles.shadow"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "basemapworld.color",
    name: "basemap.world Color",
    provider: "basemapworld",
    group: "general",
    style: "https://sgx.geodatenzentrum.de/gdz_basemapworld_vektor/styles/bm_web_wld_col.json",
    styleUrl: "https://sgx.geodatenzentrum.de/gdz_basemapworld_vektor/styles/bm_web_wld_col.json",
    providerUrl: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    license: "Datenlizenz Deutschland",
    variant: "colorful",
    coverage: "world",
    sourceType: "vector",
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: previewUrls["basemapworld.color"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.basemap",
    name: "swisstopo Basemap",
    provider: "swisstopo",
    group: "regional",
    style: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    license: "Swiss federal geodata terms",
    variant: "colorful",
    coverage: "country",
    sourceType: "vector",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: previewUrls["swisstopo.basemap"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.light",
    name: "swisstopo Light",
    provider: "swisstopo",
    group: "regional",
    style: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.lightbasemap.vt/style.json",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.lightbasemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    license: "Swiss federal geodata terms",
    variant: "light",
    coverage: "country",
    sourceType: "vector",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: previewUrls["swisstopo.light"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.imagery",
    name: "swisstopo Imagery",
    provider: "swisstopo",
    group: "imagery",
    style: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    license: "Swiss federal geodata terms",
    variant: "imagery",
    coverage: "country",
    sourceType: "hybrid",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: previewUrls["swisstopo.imagery"],
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "carto.light.raster",
    name: "CARTO Light Raster",
    provider: "carto",
    group: "raster",
    style: cartoRasterStyle,
    providerUrl: "https://carto.com/basemaps",
    usagePolicyUrl: "https://carto.com/attributions",
    attributionHtml:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    license: "CARTO and OpenStreetMap attribution required",
    variant: "light",
    coverage: "world",
    sourceType: "raster",
    lastVerifiedAt: VERIFIED_AT,
  },
] satisfies readonly BasemapDefinition[]);

function normalizeFilterValue<T>(value: OneOrMany<T> | undefined): readonly T[] | null {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value as readonly T[] : [value] as readonly T[];
}

function includesValue<T>(definitionValue: T, filterValue: OneOrMany<T> | undefined): boolean {
  const values = normalizeFilterValue(filterValue);
  return !values || values.includes(definitionValue);
}

function matchesCountry(definition: BasemapDefinition, country: OneOrMany<string> | undefined): boolean {
  const countries = normalizeFilterValue(country);

  if (!countries) {
    return true;
  }

  if (!definition.countries?.length) {
    return false;
  }

  return countries.some((value) => definition.countries?.includes(value));
}

function cloneStyle<T>(value: T): T {
  if (!value || typeof value !== "object") {
    return value;
  }

  return structuredClone(value);
}

function cloneDefinition(definition: BasemapDefinition): BasemapDefinition {
  return {
    ...definition,
    style: cloneStyle(definition.style),
    countries: definition.countries ? [...definition.countries] : undefined,
    bounds: definition.bounds ? [...definition.bounds] as [number, number, number, number] : undefined,
    defaultView: definition.defaultView
      ? {
          ...definition.defaultView,
          center: [...definition.defaultView.center] as [number, number],
        }
      : undefined,
    protocols: definition.protocols ? [...definition.protocols] : undefined,
    rasterFallback: definition.rasterFallback
      ? {
          ...definition.rasterFallback,
          tiles: [...definition.rasterFallback.tiles],
        }
      : undefined,
  };
}

export function createBasemapRegistry(
  definitions: readonly BasemapDefinition[],
  options: {
    providers?: readonly BasemapProvider[];
    groups?: readonly BasemapGroup[];
  } = {},
): BasemapRegistry {
  const immutableDefinitions = deepFreeze(definitions.map((definition) => deepFreeze(cloneDefinition(definition))));
  const immutableProviders = deepFreeze((options.providers ?? providerRegistry).map((provider) => deepFreeze({ ...provider })));
  const immutableGroups = deepFreeze((options.groups ?? basemapGroups).map((group) => deepFreeze({ ...group })));
  const byId = new Map(immutableDefinitions.map((definition) => [definition.id, definition]));
  const providersById = new Map(immutableProviders.map((provider) => [provider.id, provider]));
  const groupsById = new Map(immutableGroups.map((group) => [group.id, group]));

  return Object.freeze({
    get definitions() {
      return immutableDefinitions.map((definition) => cloneDefinition(definition));
    },
    get providers() {
      return immutableProviders.map((provider) => ({ ...provider }));
    },
    get groups() {
      return immutableGroups.map((group) => ({ ...group }));
    },
    get(id: string) {
      const definition = byId.get(id);
      return definition ? cloneDefinition(definition) : null;
    },
    getProvider(id: string) {
      const provider = providersById.get(id);
      return provider ? { ...provider } : null;
    },
    getGroup(id: string) {
      const group = groupsById.get(id);
      return group ? { ...group } : null;
    },
    list(filters: BasemapRegistryFilters = {}) {
      const {
        provider,
        group,
        variant,
        coverage,
        sourceType,
        country,
        ids,
        excludeIds,
      } = filters;

      const includeIds = normalizeFilterValue(ids);
      const excludedIds = new Set(normalizeFilterValue(excludeIds) ?? []);

      let items = immutableDefinitions.filter((definition) => {
        if (excludedIds.has(definition.id)) {
          return false;
        }

        if (includeIds && !includeIds.includes(definition.id)) {
          return false;
        }

        return (
          includesValue(definition.provider, provider) &&
          includesValue(definition.group, group) &&
          includesValue(definition.variant, variant) &&
          includesValue(definition.coverage, coverage) &&
          includesValue(definition.sourceType, sourceType) &&
          matchesCountry(definition, country)
        );
      });

      if (includeIds) {
        items = [...items].sort((left, right) => includeIds.indexOf(left.id) - includeIds.indexOf(right.id));
      }

      return items.map((definition) => cloneDefinition(definition));
    },
  } satisfies BasemapRegistry);
}

export const defaultBasemapRegistry = createBasemapRegistry(defaultDefinitions);
export const basemapRegistry = defaultBasemapRegistry.definitions;

export function listBasemaps(filters: BasemapRegistryFilters = {}, registry = defaultBasemapRegistry): BasemapDefinition[] {
  return registry.list(filters);
}

export function getBasemap(id: string, registry = defaultBasemapRegistry): BasemapDefinition | null {
  return registry.get(id);
}

export function getBasemapPreviewCandidates(idOrDefinition: string | BasemapDefinition): string[] {
  const definition = typeof idOrDefinition === "string"
    ? getBasemap(idOrDefinition)
    : idOrDefinition;

  if (!definition) {
    return [];
  }

  return [...new Set([
    generatedPreviewUrl(definition.id),
    definition.previewUrl,
  ].filter(Boolean) as string[])];
}

export function getBasemapPreviewView(idOrDefinition: string | BasemapDefinition): BasemapView {
  const definition = typeof idOrDefinition === "string"
    ? getBasemap(idOrDefinition)
    : idOrDefinition;

  if (!definition?.defaultView) {
    return {
      ...WINTERTHUR_PREVIEW_VIEW,
      center: [...WINTERTHUR_PREVIEW_VIEW.center] as [number, number],
    };
  }

  return {
    ...definition.defaultView,
    center: [...definition.defaultView.center] as [number, number],
  };
}
