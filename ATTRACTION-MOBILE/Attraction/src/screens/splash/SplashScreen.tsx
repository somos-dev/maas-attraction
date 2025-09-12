// src/screens/splash/SplashScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ATTRACTION</Text>
      <ActivityIndicator size="large" color="#00aa88" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
});

