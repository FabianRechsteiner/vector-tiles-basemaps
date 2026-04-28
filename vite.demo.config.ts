import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "vector-tiles-basemaps/style.css": fileURLToPath(new URL("./src/style.css", import.meta.url)),
      "vector-tiles-basemaps": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
  build: {
    outDir: "demo-dist",
    emptyOutDir: true,
  },
});
