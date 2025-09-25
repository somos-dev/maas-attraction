import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

interface AppCardProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
}

export default function AppCard({ title, children, style, elevation = 1 }: AppCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, style]} elevation={elevation}>
      <View
        style={[
          styles.sectionHeader,
          { backgroundColor: theme.colors.secondary },
        ]}
      >
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSecondary }]}
        >
          {title}
        </Text>
      </View>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
});
