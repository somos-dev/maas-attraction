import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  color?: string;
  size?: number;
  showHalo?: boolean; // alone pulsante per posizione utente
}

/**
 * Marker generico per posizione utente o punti dinamici.
 * - Compatibile con MapLibreGL (usa ShapeSource + CircleLayer)
 * - showHalo crea un alone semitrasparente intorno al punto
 */
export default function Marker({
  id,
  coordinate,
  color = "#2196F3",
  size = 8,
  showHalo = false,
}: MarkerProps) {
  return (
    <MapLibreGL.ShapeSource
      id={`${id}-source`}
      shape={{
        type: "Feature",
        properties: { color },
        geometry: { type: "Point", coordinates: coordinate },
      }}
    >
      {/* Alone pulsante (opzionale, per posizione utente) */}
      {showHalo && (
        <MapLibreGL.CircleLayer
          id={`${id}-halo`}
          style={{
            circleRadius: size + 10,
            circleColor: color,
            circleOpacity: 0.25,
          }}
        />
      )}

      {/* Cerchio principale */}
      <MapLibreGL.CircleLayer
        id={`${id}-layer`}
        style={{
          circleRadius: size,
          circleColor: color,
          circleStrokeWidth: 3,
          circleStrokeColor: "#fff",
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}
