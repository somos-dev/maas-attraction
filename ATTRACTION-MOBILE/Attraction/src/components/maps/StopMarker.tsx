import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface StopMarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  title: string;
  showLabel?: boolean;
  size?: number;
}

/**
 * StopMarker — Marker per fermate o origine/destinazione
 * - Colori automatici (verde = Origine, rosso = Destinazione)
 * - Label opzionale per migliore leggibilità
 */
export default function StopMarker({
  id,
  coordinate,
  title,
  showLabel = false,
  size = 7,
}: StopMarkerProps) {
  const lowerTitle = title.toLowerCase();
  const color =
    lowerTitle === "origine"
      ? "#2E8B57"
      : lowerTitle === "destinazione"
      ? "#FF3B30"
      : "#6B7280"; // fallback grigio

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
      {/* Marker principale */}
      <MapLibreGL.CircleLayer
        id={`${id}-circle`}
        style={{
          circleRadius: size,
          circleColor: ["get", "color"],
          circleStrokeWidth: 2,
          circleStrokeColor: "#fff",
        }}
      />

      {/* Label opzionale */}
      {showLabel && (
        <MapLibreGL.SymbolLayer
          id={`${id}-label`}
          style={{
            textField: ["get", "title"],
            textSize: 13,
            textOffset: [0, 1.2],
            textColor: "#222",
            textHaloColor: "#fff",
            textHaloWidth: 1,
            textAllowOverlap: true,
            textAnchor: "top",
          }}
        />
      )}
    </MapLibreGL.ShapeSource>
  );
}

