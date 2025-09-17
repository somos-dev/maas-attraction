// src/screens/home/HomeScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import MapView from "../../components/maps/MapView";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <MapView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});




