// src/screens/services/ServicesScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ServicesScreen() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }, 
      ]}
    >
      <Text
        variant="titleLarge"
        style={{ color: theme.colors.onSurface }} 
      >
        Servizi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

