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
          size={22} // 🔽 leggermente ridotto per mobile
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
          size={22} // 🔽 leggermente più piccolo
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
    marginVertical: 5,           // 🔽 meno spazio tra i due campi
    paddingVertical: 10,         // 🔽 meno alto
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 52,               // 🔽 da 60 → 52
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 32,                   // 🔽 da 40 → 32
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,             // 🔽 da 12 → 10
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginRight: 6,              // 🔽 da 8 → 6
  },
  valueText: {
    fontSize: 15,                // 🔽 da 16 → 15
    fontWeight: "500",
    lineHeight: 21,
  },
  placeholderText: {
    fontSize: 15,
    lineHeight: 21,
  },
  addressText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
    opacity: 0.7,
  },
  chevronContainer: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
