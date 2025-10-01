// src/components/map/Marker.tsx
import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  color?: string;
}

export default function Marker({ id, coordinate, color = "#FF0000" }: MarkerProps) {
  return (
    <MapLibreGL.ShapeSource
      id={`${id}-source`}
      shape={{
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { color },
            geometry: { type: "Point", coordinates: coordinate },
          },
        ],
      }}
    >
      <MapLibreGL.CircleLayer
        id={`${id}-layer`}
        style={{
          circleRadius: 8,
          circleColor: ["get", "color"],
          circleStrokeWidth: 2,
          circleStrokeColor: "#fff",
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}


