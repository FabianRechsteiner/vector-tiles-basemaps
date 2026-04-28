import {
  basemapRegistry,
  loadBasemapStyle,
  styleUsesPmtiles,
} from "../dist/index.js";

let failed = false;

for (const basemap of basemapRegistry) {
  try {
    const style = await loadBasemapStyle(basemap.id);
    const protocols = styleUsesPmtiles(style) ? " pmtiles" : "";
    console.log(`OK    ${basemap.id} (${basemap.sourceType}${protocols})`);
  } catch (error) {
    failed = true;
    console.error(`FAIL  ${basemap.id}: ${error.message}`);
  }
}

if (failed) {
  process.exitCode = 1;
}
