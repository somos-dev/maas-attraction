// src/components/map/StopMarker.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface StopMarkerProps {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  title: string;
}

export default function StopMarker({ id, coordinate, title }: StopMarkerProps) {
  return (
    <MapLibreGL.PointAnnotation id={id} coordinate={coordinate}>
      <View style={styles.container}>
        <View style={styles.dot} />
        <Text style={styles.label} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </MapLibreGL.PointAnnotation>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2E8B57", // verde primario
    borderWidth: 2,
    borderColor: "#fff",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
});

