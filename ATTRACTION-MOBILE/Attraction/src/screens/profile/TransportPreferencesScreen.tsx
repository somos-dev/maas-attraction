// src/screens/profile/TransportPreferencesScreen.tsx
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  RadioButton,
  Checkbox,
  useTheme,
  Surface,
} from "react-native-paper";

export default function TransportPreferencesScreen() {
  const theme = useTheme();

  const [routePref, setRoutePref] = useState("fastest");
  const [transportPrefs, setTransportPrefs] = useState({
    bus: false,
    train: false,
    bike: false,
    scooter: false,
    moped: false,
    car: false,
  });

  const toggleTransport = (key: keyof typeof transportPrefs) => {
    setTransportPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Imposta le tue preferenze di trasporto
        </Text>
      </View>

      {/* Tipo di Percorso */}
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
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
            Tipo di Percorso
          </Text>
        </View>

        <RadioButton.Group
          onValueChange={(value) => setRoutePref(value)}
          value={routePref}
        >
          <View style={styles.optionContainer}>
            <RadioButton.Item
              label="Più veloce"
              value="fastest"
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.radioItem}
            />
          </View>

          <View style={styles.optionContainer}>
            <RadioButton.Item
              label="Eco-sostenibile"
              value="eco"
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.radioItem}
            />
          </View>

          <View style={styles.optionContainer}>
            <RadioButton.Item
              label="A piedi"
              value="walk"
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.radioItem}
            />
          </View>
        </RadioButton.Group>
      </Surface>

      {/* Mezzi di Trasporto */}
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
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
            Mezzi di Trasporto
          </Text>
        </View>

        {/* Trasporti Pubblici */}
        <View style={styles.categorySection}>
          <Text
            variant="bodyMedium"
            style={[styles.categoryTitle, { color: theme.colors.primary }]}
          >
            Trasporti Pubblici
          </Text>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Autobus"
              status={transportPrefs.bus ? "checked" : "unchecked"}
              onPress={() => toggleTransport("bus")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Treno"
              status={transportPrefs.train ? "checked" : "unchecked"}
              onPress={() => toggleTransport("train")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>
        </View>

        {/* Mobilità Sostenibile */}
        <View style={styles.categorySection}>
          <Text
            variant="bodyMedium"
            style={[styles.categoryTitle, { color: theme.colors.primary }]}
          >
            Mobilità Sostenibile
          </Text>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Bicicletta"
              status={transportPrefs.bike ? "checked" : "unchecked"}
              onPress={() => toggleTransport("bike")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Monopattino elettrico"
              status={transportPrefs.scooter ? "checked" : "unchecked"}
              onPress={() => toggleTransport("scooter")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>
        </View>

        {/* Veicoli Privati */}
        <View style={styles.categorySection}>
          <Text
            variant="bodyMedium"
            style={[styles.categoryTitle, { color: theme.colors.primary }]}
          >
            Veicoli Privati
          </Text>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Scooter/Motocicletta"
              status={transportPrefs.moped ? "checked" : "unchecked"}
              onPress={() => toggleTransport("moped")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>

          <View style={styles.optionContainer}>
            <Checkbox.Item
              label="Automobile"
              status={transportPrefs.car ? "checked" : "unchecked"}
              onPress={() => toggleTransport("car")}
              color={theme.colors.primary}
              labelStyle={[
                styles.optionLabel,
                { color: theme.colors.onSurface },
              ]}
              style={styles.checkboxItem}
            />
          </View>
        </View>
      </Surface>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    marginBottom: 24,
    borderRadius: 12,
    paddingBottom: 16,
    overflow: "hidden", 
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  categorySection: {
    marginTop: 20,
  },
  categoryTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: "500",
    opacity: 0.8,
  },
  optionContainer: {
    marginHorizontal: 8,
    marginVertical: 2,
  },
  radioItem: {
    paddingVertical: 4,
  },
  checkboxItem: {
    paddingVertical: 4,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});





