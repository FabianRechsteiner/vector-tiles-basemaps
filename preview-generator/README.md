# Preview Generator

This directory contains an optional utility for generating PNG preview images for the basemap switcher.

Generated previews are written to `preview-generator/generated/`. The normal library build copies these images to `dist/previews/`, where the static browser API can load them.

## Requirements

- `npm install` or `npm ci`
- `npm run build`
- a local Chromium-based browser
  - Edge or Chrome are detected automatically
  - alternatively, set `PREVIEW_BROWSER_PATH`

## Usage

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

The npm script runs the library build automatically before rendering because the preview renderer imports the built ESM library from `dist/`.

## Parameters

- `--lng=<number>` center longitude
- `--lat=<number>` center latitude
- `--zoom=<number>` zoom level
- `--bearing=<number>` optional, default `0`
- `--pitch=<number>` optional, default `0`
- `--width=<number>` optional, default `160`
- `--height=<number>` optional, default `160`
- `--scale=<number>` optional, default `2`
- `--ids=<id1,id2,...>` optional list of basemap ids to render

## Examples

Render all basemaps for the default Winterthur view:

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

Render only two selected basemaps:

```bash
npm run generate:previews -- --ids=vectormap.light,openfreemap.dark --lng=8.7147 --lat=47.4951 --zoom=12
```

Render larger preview images:

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12 --width=220 --height=220 --scale=2
```
