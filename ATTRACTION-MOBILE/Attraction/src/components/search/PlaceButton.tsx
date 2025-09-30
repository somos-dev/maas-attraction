import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface PlaceButtonProps {
  label: string;
  value?: string;
  address?: string;
  icon: string;
  onPress: () => void;
}

export default function PlaceButton({
  label,
  value,
  address,
  icon,
  onPress,
}: PlaceButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          borderColor: theme.colors.outline || "#ccc",
          backgroundColor: theme.colors.surface || "#fff"
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon 
          name={icon} 
          size={24} 
          color={theme.colors.primary} 
        />
      </View>
      
      <View style={styles.textContainer}>
        {value ? (
          <>
            <Text 
              style={[styles.valueText, { color: theme.colors.onSurface || "#000" }]}
              numberOfLines={2}
            >
              {value}
            </Text>
            {address && (
              <Text 
                style={[styles.addressText, { color: theme.colors.onSurfaceVariant || "#666" }]}
                numberOfLines={2}
              >
                {address}
              </Text>
            )}
          </>
        ) : (
          <Text 
            style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant || "#999" }]}
          >
            {label}
          </Text>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <Icon 
          name="chevron-right" 
          size={24} 
          color={theme.colors.onSurfaceVariant || "#999"} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 60,
    elevation: 1, // ombra su Android
    shadowColor: "#000", // ombra su iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 22,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    opacity: 0.7,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
