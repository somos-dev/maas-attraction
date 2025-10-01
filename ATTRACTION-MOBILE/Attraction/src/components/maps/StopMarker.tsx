// src/components/map/StopMarker.tsx
import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface StopMarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  title: string;
}

export default function StopMarker({ id, coordinate, title }: StopMarkerProps) {
  // scegli colore in base al titolo
  const color =
    title.toLowerCase() === "origine"
      ? "#2E8B57" // verde
      : title.toLowerCase() === "destinazione"
      ? "#FF0000" // rosso
      : "#6B7280"; // grigio di fallback

  return (
    <MapLibreGL.ShapeSource
      id={`${id}-source`}
      shape={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { title, color },
            geometry: { type: "Point", coordinates: coordinate },
          },
        ],
      }}
    >
      {/* Cerchio colorato */}
      <MapLibreGL.CircleLayer
        id={`${id}-circle`}
        style={{
          circleRadius: 7,
          circleColor: ["get", "color"],
          circleStrokeWidth: 2,
          circleStrokeColor: "#fff",
        }}
      />

      {/* Label con titolo */}
      <MapLibreGL.SymbolLayer
        id={`${id}-label`}
        style={{
          textField: ["get", "title"],
          textSize: 12,
          textOffset: [0, 1.5],
          textColor: "#333",
          textHaloColor: "#fff",
          textHaloWidth: 1,
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}
