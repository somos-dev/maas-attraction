// src/components/trip/RouteDetails.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Divider, Chip, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface RouteDetailsProps {
  route: any; // dati del percorso normalizzati da normalizeRoutes()
}

/**
 * RouteDetails
 * ------------------------------------------------------------------
 * Mostra i dettagli di un itinerario (segmenti/legs).
 * - Coerente con normalizeRoutes() (mobile)
 * - Coerente con normalizeRouteOptionsToRoutes() (web)
 * - Allineato alle API Django (plan-trip)
 */
export default function RouteDetails({ route }: RouteDetailsProps) {
  const theme = useTheme();

  // Priorità: legs (dettagli), fallback su segments (aggregati)
  const segments = route?.legs?.length ? route.legs : route?.segments || [];

  if (!segments.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nessuna istruzione disponibile.</Text>
      </View>
    );
  }

  // Config modalità coerente con web e backend
  const MODE_CONFIG: Record<
    string,
    { icon: string; color: string; label: string }
  > = {
    walk: { icon: "walk", color: "#9E9E9E", label: "A piedi" },
    bus: { icon: "bus", color: "#2196F3", label: "Bus" },
    train: { icon: "train", color: "#FF6F00", label: "Treno" },
    tram: { icon: "tram", color: "#4CAF50", label: "Tram" },
    subway: { icon: "subway-variant", color: "#E91E63", label: "Metro" },
    car: { icon: "car", color: "#424242", label: "Auto" },
    bike: { icon: "bike", color: "#8BC34A", label: "Bici" },
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>Dettagli del viaggio</Text>
      <Divider style={styles.divider} />

      {segments.map((seg: any, i: number) => {
        const mode = (seg.type || seg.mode || "walk").toLowerCase();
        const config = MODE_CONFIG[mode] || MODE_CONFIG.walk;

        const durationMinutes = seg.duration
          ? Math.round(Number(seg.duration) / 60)
          : seg.duration_s
          ? Math.round(Number(seg.duration_s) / 60)
          : null;

        // step camminata
        const walkSteps =
          Array.isArray(seg.walk_steps) && seg.walk_steps.length > 0
            ? seg.walk_steps
            : [];

        return (
          <View key={i} style={styles.segmentCard}>
            {/* Header tratta */}
            <View style={styles.segmentHeader}>
              <View
                style={[styles.iconWrapper, { backgroundColor: config.color }]}
              >
                <Icon name={config.icon} size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modeTitle}>{config.label}</Text>

                {seg.start_time && seg.end_time ? (
                  <Text style={styles.timeInfo}>
                    🕒{" "}
                    {new Date(seg.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    →{" "}
                    {new Date(seg.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                ) : durationMinutes ? (
                  <Text style={styles.timeInfo}>⏱ {durationMinutes} min</Text>
                ) : null}
              </View>
            </View>

            {/* Linea bus/treno */}
            {seg.route && (
              <View style={styles.chipContainer}>
                <Chip
                  icon={config.icon}
                  style={[styles.routeChip, { borderColor: config.color }]}
                  textStyle={{ color: config.color, fontWeight: "600" }}
                >
                  Linea {seg.route}
                </Chip>
              </View>
            )}

            {/* Passi camminata */}
            {walkSteps.length > 0 && (
              <View style={styles.stepsContainer}>
                <Divider style={styles.stepsDivider} />
                {walkSteps.map((step: any, j: number) => (
                  <View key={j} style={styles.stepRow}>
                    <Icon
                      name="arrow-right"
                      size={14}
                      color={theme.colors.onSurfaceVariant || "#666"}
                    />
                    <Text style={styles.stepText}>
                      {step.streetName || step.name || "Strada sconosciuta"}{" "}
                      {step.distance_m
                        ? `— ${Math.round(step.distance_m)} m`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 8,
    color: "#333",
  },
  divider: { marginBottom: 12 },
  segmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  segmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modeTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  timeInfo: { fontSize: 12, color: "#777", marginTop: 4 },
  chipContainer: { marginTop: 8, flexDirection: "row" },
  routeChip: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    marginRight: 8,
  },
  stepsContainer: { marginTop: 8 },
  stepsDivider: { marginBottom: 8, backgroundColor: "#eee" },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  stepText: { fontSize: 13, color: "#555", marginLeft: 6 },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
    fontSize: 14,
  },
});
