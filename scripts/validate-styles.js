import { basemapRegistry } from "../src/basemaps.js";
import { loadBasemapStyle, validateStyleDocument } from "../src/styles.js";

let failed = false;

for (const basemap of basemapRegistry) {
  try {
    const styleDocument = await loadBasemapStyle(basemap.id);
    validateStyleDocument(styleDocument, basemap.id);
    console.log(`OK    ${basemap.id} (${basemap.sourceMode})`);
  } catch (error) {
    failed = true;
    console.error(`FAIL  ${basemap.id}: ${error.message}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Validated ${basemapRegistry.length} basemap styles.`);
}
