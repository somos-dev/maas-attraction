import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

interface StopMarkerProps {
  id: string;
  coordinate: [number, number];
  title: string;
}

export default function StopMarker({ id, coordinate, title }: StopMarkerProps) {
  return (
    <MapLibreGL.PointAnnotation id={id} coordinate={coordinate}>
      <View style={styles.container}>
        <View style={styles.dot} />
        <Text style={styles.label}>{title}</Text>
      </View>
    </MapLibreGL.PointAnnotation>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2E8B57", // verde primario del tuo tema
    borderWidth: 2,
    borderColor: "#fff",
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: "#333",
  },
});
