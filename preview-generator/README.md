# Preview Generator

Dieses Verzeichnis ist ein optionales Zusatzwerkzeug zum Erzeugen von PNG-Vorschaubildern fuer den Basemap-Switcher.

Die Vorschaubilder werden in `preview-generator/generated/` geschrieben und koennen anschliessend vom Switcher verwendet werden.

## Voraussetzungen

- `npm install`
- `npm run build`
- ein lokaler Chromium-basierter Browser
  - Edge oder Chrome werden automatisch gesucht
  - alternativ `PREVIEW_BROWSER_PATH` setzen

## Aufruf

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

Das npm-Script fuehrt den Library-Build automatisch vor dem Rendern aus, weil der Renderer die gebaute ESM-Library aus `dist/` verwendet.

## Wichtige Parameter

- `--lng=<number>` Mittelpunkt Laengengrad
- `--lat=<number>` Mittelpunkt Breitengrad
- `--zoom=<number>` Zoomstufe
- `--bearing=<number>` optional, Standard `0`
- `--pitch=<number>` optional, Standard `0`
- `--width=<number>` optional, Standard `160`
- `--height=<number>` optional, Standard `160`
- `--scale=<number>` optional, Standard `2`
- `--ids=<id1,id2,...>` optional, um nur bestimmte Basemaps zu rendern

## Beispiele

Alle Basemaps fuer Sonnenbergpark Winterthur:

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12
```

Nur zwei bestimmte Basemaps:

```bash
npm run generate:previews -- --ids=vectormap.light,openfreemap.dark --lng=8.7147 --lat=47.4951 --zoom=12
```

Groessere Vorschaubilder:

```bash
npm run generate:previews -- --lng=8.7147 --lat=47.4951 --zoom=12 --width=220 --height=220 --scale=2
```
