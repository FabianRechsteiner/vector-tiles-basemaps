import { copyFile, cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("src/style.css");
const target = resolve("dist/style.css");
const previewSource = resolve("preview-generator/generated");
const previewTarget = resolve("dist/previews");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
await cp(previewSource, previewTarget, {
  recursive: true,
  filter: (path) => path.endsWith(".png") || path === previewSource,
});
