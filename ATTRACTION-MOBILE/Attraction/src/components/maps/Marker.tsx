// src/components/map/Marker.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface MarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  color?: string;
}

export default function Marker({ id, coordinate, color = "#FF0000" }: MarkerProps) {
  return (
    <MapLibreGL.PointAnnotation id={id} coordinate={coordinate}>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </MapLibreGL.PointAnnotation>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

