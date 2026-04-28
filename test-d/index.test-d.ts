import { expectAssignable, expectType } from "tsd";
import type { IControl, StyleSpecification } from "maplibre-gl";
import {
  BasemapControl,
  applyBasemap,
  createBasemapRegistry,
  getBasemap,
  listBasemaps,
  registerPmtilesProtocol,
  type BasemapControlOptions,
  type BasemapDefinition,
  type BasemapRegistry,
} from "../dist/index.js";

const style: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [],
};

const definition: BasemapDefinition = {
  id: "custom.light",
  name: "Custom Light",
  provider: "custom",
  group: "general",
  style,
  variant: "light",
  coverage: "world",
  sourceType: "vector",
};

expectAssignable<IControl>(new BasemapControl({
  basemapIds: ["custom.light"],
  position: "bottom-left",
  onBasemapChange(event) {
    expectType<BasemapDefinition>(event.basemap);
    expectType<StyleSpecification>(event.style);
  },
}));

expectAssignable<BasemapControlOptions>({
  filters: { sourceType: ["vector", "raster"], provider: "custom" },
  onPreview(basemap) {
    expectType<BasemapDefinition | null>(basemap);
  },
  applyOptions: {
    captureOverlays() {
      return { overlays: true };
    },
    restoreOverlays(snapshot) {
      expectType<unknown>(snapshot);
    },
  },
});

const registry = createBasemapRegistry([definition]);
expectType<BasemapRegistry>(registry);
expectType<BasemapDefinition[]>(listBasemaps({ ids: ["custom.light"] }, registry));
expectType<BasemapDefinition | null>(getBasemap("custom.light", registry));

declare const map: Parameters<typeof applyBasemap>[0];
expectType<Promise<{ basemap: BasemapDefinition; previousBasemap: BasemapDefinition | null; style: StyleSpecification }>>(
  applyBasemap(map, "custom.light", { registry }),
);

registerPmtilesProtocol(
  { addProtocol() {}, removeProtocol() {} },
  { Protocol: class { tile = () => null; } },
);
