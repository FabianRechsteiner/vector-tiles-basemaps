const VERIFIED_AT = "2026-04-21";

function assetUrl(relativePath) {
  return new URL(relativePath, import.meta.url).href;
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
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.liberty",
    name: "OpenFreeMap Liberty",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
    variant: "light",
    coverage: "world",
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.bright",
    name: "OpenFreeMap Bright",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/bright",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
    variant: "colorful",
    coverage: "world",
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openfreemap.positron",
    name: "OpenFreeMap Positron",
    provider: "openfreemap",
    styleUrl: "https://tiles.openfreemap.org/styles/positron",
    providerUrl: "https://openfreemap.org/",
    usagePolicyUrl: "https://openfreemap.org/tos/",
    attributionHtml: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
    variant: "gray",
    coverage: "world",
    status: "stable",
    sourceMode: "remote",
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
    status: "stable",
    sourceMode: "remote",
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
    status: "stable",
    sourceMode: "remote",
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
    status: "stable",
    sourceMode: "remote",
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
    status: "stable",
    sourceMode: "remote",
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
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "basemapde.color",
    name: "basemap.de Farbe",
    provider: "basemapde",
    styleUrl: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json",
    providerUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    variant: "colorful",
    coverage: "country",
    countries: ["DE"],
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "basemapde.relief",
    name: "basemap.de Relief",
    provider: "basemapde",
    styleUrl: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json",
    providerUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    variant: "relief",
    coverage: "country",
    countries: ["DE"],
    status: "stable",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "basemapde.gray",
    name: "basemap.de Grau",
    provider: "basemapde",
    styleUrl: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json",
    providerUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    usagePolicyUrl: "https://gdz.bkg.bund.de/index.php/default/open-data/gdz-basemapde-vektor-gdz-basemapde-vektor.html",
    variant: "gray",
    coverage: "country",
    countries: ["DE"],
    status: "stable",
    sourceMode: "remote",
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
    previewUrl: assetUrl("../basemap_preview/Basemap_World.png"),
    status: "stable",
    sourceMode: "remote",
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
    previewUrl: assetUrl("../basemap_preview/Swisstopo_Basemap.png"),
    status: "restricted",
    sourceMode: "remote",
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
    status: "restricted",
    sourceMode: "remote",
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
    status: "restricted",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openmaptiles.osm-bright",
    name: "OpenMapTiles OSM Bright",
    provider: "openmaptiles",
    styleUrl: "https://openmaptiles.github.io/osm-bright-gl-style/style-cdn.json",
    providerUrl: "https://openmaptiles.org/styles/",
    usagePolicyUrl: "https://openmaptiles.org/docs/website/maplibre-gl-js/",
    attributionHtml: "© OpenMapTiles © OpenStreetMap contributors",
    variant: "colorful",
    coverage: "world",
    status: "experimental",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openmaptiles.positron",
    name: "OpenMapTiles Positron",
    provider: "openmaptiles",
    styleUrl: "https://openmaptiles.github.io/positron-gl-style/style-cdn.json",
    providerUrl: "https://openmaptiles.org/styles/",
    usagePolicyUrl: "https://openmaptiles.org/docs/website/maplibre-gl-js/",
    attributionHtml: "© OpenMapTiles © OpenStreetMap contributors",
    variant: "light",
    coverage: "world",
    status: "experimental",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openmaptiles.dark-matter",
    name: "OpenMapTiles Dark Matter",
    provider: "openmaptiles",
    styleUrl: "https://openmaptiles.github.io/dark-matter-gl-style/style-cdn.json",
    providerUrl: "https://openmaptiles.org/styles/",
    usagePolicyUrl: "https://openmaptiles.org/docs/website/maplibre-gl-js/",
    attributionHtml: "© OpenMapTiles © OpenStreetMap contributors",
    variant: "dark",
    coverage: "world",
    status: "experimental",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "openmaptiles.basic",
    name: "OpenMapTiles Basic",
    provider: "openmaptiles",
    styleUrl: "https://openmaptiles.github.io/maptiler-basic-gl-style/style-cdn.json",
    providerUrl: "https://openmaptiles.org/styles/",
    usagePolicyUrl: "https://openmaptiles.org/docs/website/maplibre-gl-js/",
    attributionHtml: "© OpenMapTiles © OpenStreetMap contributors",
    variant: "colorful",
    coverage: "world",
    status: "experimental",
    sourceMode: "remote",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "protomaps.light.de",
    name: "Protomaps Light (DE)",
    provider: "protomaps",
    localStylePath: assetUrl("../styles/protomaps_light_de.json"),
    providerUrl: "https://github.com/protomaps/basemaps",
    usagePolicyUrl: "https://docs.protomaps.com/basemaps/downloads",
    attributionHtml: "© Protomaps © OpenStreetMap",
    variant: "light",
    coverage: "world",
    status: "experimental",
    sourceMode: "local-fallback",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "protomaps.light.en",
    name: "Protomaps Light (EN)",
    provider: "protomaps",
    localStylePath: assetUrl("../styles/protomaps_light_en.json"),
    providerUrl: "https://github.com/protomaps/basemaps",
    usagePolicyUrl: "https://docs.protomaps.com/basemaps/downloads",
    attributionHtml: "© Protomaps © OpenStreetMap",
    variant: "light",
    coverage: "world",
    status: "experimental",
    sourceMode: "local-fallback",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "protomaps.dark.de",
    name: "Protomaps Dark (DE)",
    provider: "protomaps",
    localStylePath: assetUrl("../styles/protomaps_dark_de.json"),
    providerUrl: "https://github.com/protomaps/basemaps",
    usagePolicyUrl: "https://docs.protomaps.com/basemaps/downloads",
    attributionHtml: "© Protomaps © OpenStreetMap",
    variant: "dark",
    coverage: "world",
    status: "experimental",
    sourceMode: "local-fallback",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "protomaps.dark.en",
    name: "Protomaps Dark (EN)",
    provider: "protomaps",
    localStylePath: assetUrl("../styles/protomaps_dark_en.json"),
    providerUrl: "https://github.com/protomaps/basemaps",
    usagePolicyUrl: "https://docs.protomaps.com/basemaps/downloads",
    attributionHtml: "© Protomaps © OpenStreetMap",
    variant: "dark",
    coverage: "world",
    status: "experimental",
    sourceMode: "local-fallback",
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: "protomaps.data-viz-white.de",
    name: "Protomaps Data Viz White (DE)",
    provider: "protomaps",
    localStylePath: assetUrl("../styles/protomaps_data_viz_white_de.json"),
    providerUrl: "https://github.com/protomaps/basemaps",
    usagePolicyUrl: "https://docs.protomaps.com/basemaps/downloads",
    attributionHtml: "© Protomaps © OpenStreetMap",
    variant: "white",
    coverage: "world",
    status: "experimental",
    sourceMode: "local-fallback",
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
    status,
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
      includesValue(definition.status, status) &&
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

export { registry as basemapRegistry };
