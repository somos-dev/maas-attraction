import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";

interface AppListItemProps {
  icon: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightIcon?: string; // es. "chevron-right"
}

export default function AppListItem({
  icon,
  title,
  description,
  onPress,
  rightIcon,
}: AppListItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <IconButton
        icon={icon}
        size={28}
        iconColor={theme.colors.primary}
        style={styles.leftIcon}
      />
      <View style={styles.textContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
          {title}
        </Text>
        {description && (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {description}
          </Text>
        )}
      </View>
      {rightIcon && (
        <IconButton
          icon={rightIcon}
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  leftIcon: {
    margin: 0,
  },
  textContainer: {
    flex: 1,
    marginLeft: 4,
  },
});
