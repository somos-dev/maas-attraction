import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import MapView from "../../components/maps/MapView";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Chip, Divider, useTheme } from "react-native-paper";

const { height } = Dimensions.get("window");

// 🔹 Colori e icone per modalità di trasporto
const MODE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  walk: { icon: "walk", color: "#9E9E9E", label: "A piedi" },
  bus: { icon: "bus", color: "#2196F3", label: "Bus" },
  train: { icon: "train", color: "#FF6F00", label: "Treno" },
  tram: { icon: "tram", color: "#4CAF50", label: "Tram" },
  subway: { icon: "subway-variant", color: "#E91E63", label: "Metro" },
  car: { icon: "car", color: "#424242", label: "Auto" },
  bike: { icon: "bike", color: "#8BC34A", label: "Bici" },
};

export default function TripDetailsScreen({ route }: any) {
  const theme = useTheme();
  const trip = route.params?.trip;

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nessun viaggio disponibile</Text>
      </View>
    );
  }

  const legs = Array.isArray(trip.legs) ? trip.legs : [];

  return (
    <View style={styles.container}>
      {/* 🔹 Mappa */}
      <View style={styles.mapContainer}>
        <MapView route={trip} showStops showMarkers highlightColor={theme.colors.primary} />
      </View>

      {/* 🔹 Dettagli del viaggio */}
      <ScrollView
        style={styles.detailsContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dettagli del viaggio</Text>
          <Text style={styles.subTitle}>
            {trip.fromStationName} → {trip.toStationName}
          </Text>
          <Text style={styles.infoText}>
            Durata totale: {trip.duration} min · Distanza: {trip.distance} km
          </Text>
        </View>

        <Divider style={styles.headerDivider} />

        {legs.length === 0 ? (
          <Text style={styles.emptyText}>Nessuna tappa disponibile</Text>
        ) : (
          legs.map((leg: any, i: number) => {
            const mode = (leg.type || leg.mode || "walk").toLowerCase();
            const config = MODE_CONFIG[mode] || MODE_CONFIG.walk;

            return (
              <View key={i} style={styles.legContainer}>
                {/* 🔹 Header della tappa */}
                <View style={styles.legHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: config.color },
                    ]}
                  >
                    <Icon name={config.icon} size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legTitle}>{config.label}</Text>
                    <Text style={styles.legSubtitle}>
                      {leg.from || "Partenza sconosciuta"} →{" "}
                      {leg.to || "Arrivo sconosciuto"}
                    </Text>
                  </View>
                </View>

                {/* 🔹 Informazioni principali */}
                <View style={styles.legInfo}>
                  <Text style={styles.legDetail}>
                    🕒 {leg.duration || "Durata sconosciuta"} ·{" "}
                    {Math.round(leg.distance_m || 0)} m
                  </Text>

                  {leg.start_time && leg.end_time && (
                    <Text style={styles.legTime}>
                      {new Date(leg.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(leg.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>

                {/* 🔹 Se è una linea bus o treno */}
                {leg.route && (
                  <View style={styles.routeChipContainer}>
                    <Chip
                      icon={config.icon}
                      style={[styles.routeChip, { borderColor: config.color }]}
                      textStyle={{ color: config.color }}
                    >
                      Linea {leg.route}
                    </Chip>
                  </View>
                )}

                {/* 🔹 Step camminata */}
                {Array.isArray(leg.walk_steps) && leg.walk_steps.length > 0 && (
                  <View style={styles.stepsContainer}>
                    {leg.walk_steps.map((step: any, j: number) => (
                      <View key={j} style={styles.stepRow}>
                        <Icon
                          name="arrow-right"
                          size={14}
                          color={theme.colors.onSurfaceVariant || "#666"}
                        />
                        <Text style={styles.stepText}>
                          {step.streetName || "Strada sconosciuta"} —{" "}
                          {step.distance_m} m
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 🔹 Divider */}
                {i < legs.length - 1 && (
                  <Divider style={styles.legDivider} />
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  mapContainer: {
    height: height * 0.45,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  subTitle: { fontSize: 14, color: "#666", marginTop: 4 },
  infoText: { fontSize: 13, color: "#777", marginTop: 2 },
  headerDivider: { marginVertical: 10 },
  legContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  legHeader: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  legTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
  legSubtitle: { fontSize: 13, color: "#666" },
  legInfo: { marginTop: 8 },
  legDetail: { fontSize: 13, color: "#555" },
  legTime: { fontSize: 12, color: "#777", marginTop: 2 },
  routeChipContainer: { marginTop: 6, flexDirection: "row" },
  routeChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    marginRight: 8,
  },
  stepsContainer: { marginTop: 8, marginLeft: 4 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  stepText: { fontSize: 13, color: "#555", marginLeft: 6 },
  legDivider: { marginTop: 10 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#777", fontStyle: "italic" },
});
