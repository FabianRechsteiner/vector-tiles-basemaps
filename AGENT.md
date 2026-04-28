# AGENT.md - Project Instructions

This repository is a TypeScript-first MapLibre GL JS basemap control library.

## Project Context

- Package name: `vector-tiles-basemaps`
- Goal: provide a professional alternative to raster-only basemap switchers by supporting MapLibre style URLs, vector tile basemaps, typed provider registries, optional PMTiles workflows, and accessible control UI.
- Runtime target: browser applications using MapLibre GL JS.
- Distribution target: npm package with ESM output, TypeScript declarations, and a CSS bundle.

## Branch Policy

- Work on the current `agent` branch unless the user explicitly requests another branch.
- Before code changes, verify the current branch.
- If this file conflicts with a direct user instruction in the active task, ask only when the conflict would make the requested work unsafe.

## Technology

- Source lives in `src/**/*.ts`.
- Build output is `dist/` and is not committed.
- The package is ESM-only for v1; do not add CJS unless requested.
- `maplibre-gl` is a peer dependency.
- `pmtiles` is optional. Do not hard-import it from library code.
- Export styling through `vector-tiles-basemaps/style.css`; do not inject runtime CSS from JavaScript.

## MapLibre Requirements

- `BasemapControl` must implement MapLibre's `IControl` shape: `onAdd(map): HTMLElement`, `onRemove(): void`, and optional `getDefaultPosition()`.
- The root control element must include `maplibregl-ctrl`.
- Basemap styles must be MapLibre style specification version 8 documents or URLs resolving to them.
- Style switching should preload/validate before `map.setStyle`, preserve camera by default, and expose explicit failure callbacks.
- Overlay preservation must remain opt-in through callbacks.

## Verification

Run these checks for substantive changes:

```bash
npm run lint
npm run test
npm run test:types
npm run build
```

`npm run validate:styles` is network-dependent and should not be required for deterministic CI.

## Documentation

Keep `README.md` npm-consumer focused: installation, minimal MapLibre example, API, custom provider configuration, PMTiles setup, styling, accessibility, and compatibility notes.
