import React from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface FilterIconButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function FilterIconButton({ onPress, style }: FilterIconButtonProps) {
  const theme = useTheme();

  return (
    <IconButton
      icon="filter-variant"
      size={26}
      onPress={onPress}
      style={[styles.iconButton, style]}
      containerColor={theme.colors.primaryContainer}
      iconColor={theme.colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: 24,
    elevation: 2,
  },
});

