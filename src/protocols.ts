import type { MapLibreProtocolHost, PmtilesLibrary } from "./types.js";

export function registerPmtilesProtocol(maplibregl: MapLibreProtocolHost, pmtiles: PmtilesLibrary): () => void {
  if (!maplibregl?.addProtocol) {
    throw new Error("MapLibre protocol registration is unavailable.");
  }

  if (!pmtiles?.Protocol) {
    throw new Error("A pmtiles library with Protocol is required.");
  }

  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  return () => {
    maplibregl.removeProtocol?.("pmtiles");
  };
}
