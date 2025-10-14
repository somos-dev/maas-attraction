import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

interface AppCardProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  icon?: string;
}

export default function AppCard({ 
  title, 
  children, 
  style, 
  elevation = 2,
  icon 
}: AppCardProps) {
  const theme = useTheme();

  return (
    <Card 
      style={[
        styles.card, 
        { backgroundColor: theme.colors.surface },
        style
      ]} 
      elevation={elevation}
    >
      <View style={[styles.sectionHeader]}>
        <View style={styles.headerContent}>
          {icon && (
            <View 
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primaryContainer }
              ]}
            >
              <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
          )}
          <Text
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            {title}
          </Text>
        </View>
      </View>
      <Card.Content style={styles.content}>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.3,
    flex: 1,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});