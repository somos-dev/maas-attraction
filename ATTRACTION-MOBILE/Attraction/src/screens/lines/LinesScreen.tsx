// src/screens/lines/LinesScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, SegmentedButtons, useTheme } from "react-native-paper";

export default function LinesScreen() {
  const [value, setValue] = useState("bus");
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          {
            value: "bus",
            label: "Bus",
            style: {
              backgroundColor:
                value === "bus" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "bus"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface, // 👈 coerente col tema
              fontWeight: "bold",
            },
          },
          {
            value: "train",
            label: "Treni",
            style: {
              backgroundColor:
                value === "train" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "train"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface, // 👈 coerente col tema
              fontWeight: "bold",
            },
          },
          {
            value: "favorites",
            label: "Preferiti",
            style: {
              backgroundColor:
                value === "favorites" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "favorites"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface, // 👈 coerente col tema
              fontWeight: "bold",
            },
          },
        ]}
        style={styles.segmented}
      />

      <View style={styles.content}>
        {value === "bus" && <Text variant="titleLarge">Linee Bus</Text>}
        {value === "train" && <Text variant="titleLarge">Linee Treni</Text>}
        {value === "favorites" && <Text variant="titleLarge">Preferiti</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  segmented: {
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
