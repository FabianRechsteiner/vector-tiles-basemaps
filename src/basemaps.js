const VERIFIED_AT = "2026-04-21";

const WINTERTHUR_PREVIEW_VIEW = Object.freeze({
  center: [8.7147, 47.4951],
  zoom: 12,
  bearing: 0,
  pitch: 0,
});

function assetUrl(relativePath) {
  return new URL(relativePath, import.meta.url).href;
}

function generatedPreviewUrl(id) {
  return assetUrl(`../preview-generator/generated/${id}.png`);
}

const registry = Object.freeze([
  {
    id: "vectormap.light",
    name: "Vectormap Light",
    provider: "vectormap",
    styleUrl: "https://vectormap.ch/styles/ch.vectormap.lightbasemap.json",
    providerUrl: "https://vectormap.ch/maps.html",
    usagePolicyUrl: "https://vectormap.ch/maps.html",
    variant: "light",
    coverage: "country",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.liberty",
    name: "OpenFreeMap Liberty",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    variant: "light",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.bright",
    name: "OpenFreeMap Bright",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/bright",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    variant: "colorful",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.positron",
    name: "OpenFreeMap Positron",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    variant: "gray",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.dark",
    name: "OpenFreeMap Dark",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/dark",
    providerUrl: "https://github.com/hyperknot/openfreemap-styles",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    variant: "dark",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.fiord",
    name: "OpenFreeMap Fiord",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/fiord",
    providerUrl: "https://github.com/hyperknot/openfreemap-styles",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap &copy; OpenMapTiles Data from OpenStreetMap",
    variant: "dark",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.colorful",
    name: "VersaTiles Colorful",
    provider: "versatiles",
    styleUrl: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    variant: "colorful",
    coverage: "world",
    previewUrl: assetUrl("../basemap_preview/VersaTiles_Colorful.png"),
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.eclipse",
    name: "VersaTiles Eclipse",
    provider: "versatiles",
    styleUrl: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    variant: "dark",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.graybeard",
    name: "VersaTiles Graybeard",
    provider: "versatiles",
    styleUrl: "https://tiles.versatiles.org/assets/styles/graybeard/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    variant: "gray",
    coverage: "world",
    previewUrl: assetUrl("../basemap_preview/VersaTiles_Graybeard.png"),
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.neutrino",
    name: "VersaTiles Neutrino",
    provider: "versatiles",
    styleUrl: "https://tiles.versatiles.org/assets/styles/neutrino/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    variant: "light",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "versatiles.shadow",
    name: "VersaTiles Shadow",
    provider: "versatiles",
    styleUrl: "https://tiles.versatiles.org/assets/styles/shadow/style.json",
    providerUrl: "https://versatiles.org/",
    usagePolicyUrl: "https://docs.versatiles.org/guides/use_tiles_versatiles_org",
    variant: "dark",
    coverage: "world",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "basemapworld.color",
    name: "basemap.world Color",
    provider: "basemapworld",
    styleUrl: "https://sgx.geodatenzentrum.de/gdz_basemapworld_vektor/styles/bm_web_wld_col.json",
    providerUrl: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/gdz-basemapworld-vektor-gdz-basemapworld-vektor-html.html",
    variant: "colorful",
    coverage: "world",
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: assetUrl("../basemap_preview/Basemap_World.png"),
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.basemap",
    name: "swisstopo Basemap",
    provider: "swisstopo",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    variant: "colorful",
    coverage: "country",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    previewUrl: assetUrl("../basemap_preview/Swisstopo_Basemap.png"),
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.light",
    name: "swisstopo Light",
    provider: "swisstopo",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.lightbasemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    variant: "light",
    coverage: "country",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "swisstopo.imagery",
    name: "swisstopo Imagery",
    provider: "swisstopo",
    styleUrl: "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap.vt/style.json",
    providerUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    usagePolicyUrl: "https://www.geo.admin.ch/en/vector-tiles-service-available-services-and-data",
    variant: "imagery",
    coverage: "country",
    countries: ["CH", "LI"],
    bounds: [5.95, 45.73, 10.65, 47.95],
    defaultView: WINTERTHUR_PREVIEW_VIEW,
    lastVerifiedAt: VERIFIED_AT,
  },
]);

function normalizeFilterValue(value) {
  if (value == null) {
    return null;
  }

  return Array.isArray(value) ? value : [value];
}

function includesValue(definitionValue, filterValue) {
  const values = normalizeFilterValue(filterValue);

  if (!values) {
    return true;
  }

  return values.includes(definitionValue);
}

function matchesCountry(definition, country) {
  const countries = normalizeFilterValue(country);

  if (!countries) {
    return true;
  }

  if (!definition.countries?.length) {
    return false;
  }

  return countries.some((value) => definition.countries.includes(value));
}

export function listBasemaps(filters = {}) {
  const {
    provider,
    variant,
    coverage,
    country,
    ids,
    excludeIds,
  } = filters;

  const includeIds = normalizeFilterValue(ids);
  const excludedIds = new Set(normalizeFilterValue(excludeIds) ?? []);

  let items = registry.filter((definition) => {
    if (excludedIds.has(definition.id)) {
      return false;
    }

    if (includeIds && !includeIds.includes(definition.id)) {
      return false;
    }

    return (
      includesValue(definition.provider, provider) &&
      includesValue(definition.variant, variant) &&
      includesValue(definition.coverage, coverage) &&
      matchesCountry(definition, country)
    );
  });

  if (includeIds) {
    items = [...items].sort((left, right) => includeIds.indexOf(left.id) - includeIds.indexOf(right.id));
  }

  return items.map((definition) => ({ ...definition }));
}

export function getBasemap(id) {
  const definition = registry.find((item) => item.id === id);
  return definition ? { ...definition } : null;
}

export function getBasemapPreviewCandidates(idOrDefinition) {
  const definition = typeof idOrDefinition === "string"
    ? getBasemap(idOrDefinition)
    : idOrDefinition;

  if (!definition) {
    return [];
  }

  const candidates = [
    generatedPreviewUrl(definition.id),
    definition.previewUrl,
  ];

  return [...new Set(candidates.filter(Boolean))];
}

export function getBasemapPreviewView(idOrDefinition) {
  const definition = typeof idOrDefinition === "string"
    ? getBasemap(idOrDefinition)
    : idOrDefinition;

  if (!definition?.defaultView) {
    return { ...WINTERTHUR_PREVIEW_VIEW };
  }

  return {
    ...definition.defaultView,
    center: [...definition.defaultView.center],
  };
}

export { registry as basemapRegistry };
