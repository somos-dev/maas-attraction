// src/components/common/button/AppButton.tsx
import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Button } from "react-native-paper";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  mode?: "text" | "outlined" | "contained";
}

export default function AppButton({
  label,
  onPress,
  style,
  mode = "contained",
}: AppButtonProps) {
  return (
    <Button
      mode={mode}
      style={[styles.button, style]}
      contentStyle={{ paddingVertical: 2 }}
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: "30%",
    marginBottom: 24,
    borderRadius: 30,
  },
});

