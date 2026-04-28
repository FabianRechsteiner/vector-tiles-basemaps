import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { basemapRegistry } from "../dist/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "preview-generator", "generated");

const browserCandidates = [
  process.env.PREVIEW_BROWSER_PATH,
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

function mimeTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function argValue(name, fallback) {
  const argument = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
}

function numberArg(name, fallback) {
  const value = Number(argValue(name, fallback));
  if (!Number.isFinite(value)) {
    throw new Error(`Expected --${name} to be numeric.`);
  }
  return value;
}

function selectedBasemapIds() {
  const rawIds = argValue("ids", "");

  if (!rawIds) {
    return basemapRegistry.map((item) => item.id);
  }

  const requestedIds = rawIds
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return basemapRegistry
    .filter((item) => requestedIds.includes(item.id))
    .map((item) => item.id);
}

function previewOptions() {
  return {
    lng: numberArg("lng", 8.7147),
    lat: numberArg("lat", 47.4951),
    zoom: numberArg("zoom", 12),
    bearing: numberArg("bearing", 0),
    pitch: numberArg("pitch", 0),
    width: numberArg("width", 160),
    height: numberArg("height", 160),
    deviceScaleFactor: numberArg("scale", 2),
  };
}

async function findBrowserExecutable() {
  for (const candidate of browserCandidates) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

async function resolvePlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    throw new Error("playwright-core is not installed. Run `npm install` before generating previews.");
  }
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestedPath = new URL(request.url, "http://127.0.0.1").pathname;
      const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
      const filePath = safePath === "/"
        ? path.join(repoRoot, "preview-generator", "preview-renderer.html")
        : path.join(repoRoot, safePath);

      const contents = await readFile(filePath);
      response.writeHead(200, { "Content-Type": mimeTypeFor(filePath) });
      response.end(contents);
    } catch (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Not found: ${error.message}`);
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

function previewUrl(baseUrl, basemapId, options) {
  const params = new URLSearchParams({
    basemap: basemapId,
    lng: String(options.lng),
    lat: String(options.lat),
    zoom: String(options.zoom),
    bearing: String(options.bearing),
    pitch: String(options.pitch),
    width: String(options.width),
    height: String(options.height),
  });

  return `${baseUrl}/preview-generator/preview-renderer.html?${params.toString()}`;
}

async function main() {
  const browserPath = await findBrowserExecutable();

  if (!browserPath) {
    throw new Error("No supported local browser was found. Set PREVIEW_BROWSER_PATH to Edge or Chrome.");
  }

  const ids = selectedBasemapIds();

  if (!ids.length) {
    throw new Error("No basemap ids selected.");
  }

  const options = previewOptions();
  const playwright = await resolvePlaywright();
  const { server, baseUrl } = await startStaticServer();
  await mkdir(outputDir, { recursive: true });
  let failed = false;

  try {
    const browser = await playwright.chromium.launch({
      executablePath: browserPath,
      headless: true,
    });

    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: options.height,
      },
      deviceScaleFactor: options.deviceScaleFactor,
    });

    for (const basemapId of ids) {
      try {
        const outputPath = path.join(outputDir, `${basemapId}.png`);
        await page.goto(previewUrl(baseUrl, basemapId, options), { waitUntil: "load" });
        await page.waitForFunction(() => globalThis.__previewReady === true || Boolean(globalThis.__previewError), null, { timeout: 30000 });

        const previewError = await page.evaluate(() => globalThis.__previewError ?? null);
        if (previewError) {
          throw new Error(previewError);
        }

        await page.locator("#previewMap").screenshot({ path: outputPath });
        console.log(`OK    ${basemapId} -> ${path.relative(repoRoot, outputPath)}`);
      } catch (error) {
        failed = true;
        console.error(`FAIL  ${basemapId}: ${error.message}`);
      }
    }

    await browser.close();
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`FAIL  preview generation: ${error.message}`);
  process.exitCode = 1;
});
