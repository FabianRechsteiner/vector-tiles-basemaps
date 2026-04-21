import assert from "node:assert/strict";

import {
  getBasemap,
  listBasemaps,
  loadBasemapStyle,
  resolveBasemapStyle,
} from "../src/index.js";

async function run(name, callback) {
  try {
    await callback();
    console.log(`OK    ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

await run("getBasemap returns remote public entries", () => {
  const basemap = getBasemap("vectormap.light");

  assert.ok(basemap);
  assert.equal(basemap.provider, "vectormap");
  assert.equal(basemap.sourceMode, "remote");
  assert.match(basemap.styleUrl, /^https:\/\//);
});

await run("getBasemap returns local fallback entries", () => {
  const basemap = getBasemap("protomaps.light.de");

  assert.ok(basemap);
  assert.equal(basemap.sourceMode, "local-fallback");
  assert.match(basemap.localStylePath, /^file:\/\//);
});

await run("listBasemaps preserves explicit id order", () => {
  const basemaps = listBasemaps({
    ids: ["swisstopo.basemap", "vectormap.light", "protomaps.light.de"],
  });

  assert.deepEqual(
    basemaps.map((item) => item.id),
    ["swisstopo.basemap", "vectormap.light", "protomaps.light.de"],
  );
});

await run("listBasemaps filters by variant and provider", () => {
  const basemaps = listBasemaps({
    provider: "versatiles",
    variant: "gray",
  });

  assert.deepEqual(basemaps.map((item) => item.id), ["versatiles.graybeard"]);
});

await run("resolveBasemapStyle prefers remote URLs", () => {
  assert.deepEqual(resolveBasemapStyle("basemapde.relief"), {
    id: "basemapde.relief",
    sourceMode: "remote",
    url: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json",
  });
});

await run("resolveBasemapStyle returns local fallback URLs", () => {
  const resolved = resolveBasemapStyle("protomaps.dark.en");

  assert.equal(resolved.sourceMode, "local-fallback");
  assert.match(resolved.url, /^file:\/\//);
});

await run("loadBasemapStyle normalizes local pmtiles sources", async () => {
  const styleDocument = await loadBasemapStyle("protomaps.light.de");

  assert.equal(styleDocument.version, 8);
  assert.match(styleDocument.sources.protomaps.url, /^pmtiles:\/\//);
});
