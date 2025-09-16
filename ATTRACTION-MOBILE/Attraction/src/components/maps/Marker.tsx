import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MarkerProps {
  id: string;
  coordinate: [number, number];
}

export default function Marker({ id, coordinate }: MarkerProps) {
  return (
    <MapLibreGL.PointAnnotation id={id} coordinate={coordinate}>
      {/* qui puoi mettere un'icona personalizzata */}
    </MapLibreGL.PointAnnotation>
  );
}
