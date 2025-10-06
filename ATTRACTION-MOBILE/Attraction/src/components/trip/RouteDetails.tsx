import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Divider } from "react-native-paper";

interface RouteDetailsProps {
  route: any; // dati del percorso Valhalla / API backend
}

/**
 * RouteDetails — Pannello testuale con le istruzioni del percorso.
 * Mostra: modalità, nomi vie, fermate, stazioni.
 */
export default function RouteDetails({ route }: RouteDetailsProps) {
  if (!route?.segments?.length && !route?.legs?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nessuna istruzione disponibile.</Text>
      </View>
    );
  }

  // Fallback universale (compatibile Valhalla e OSRM)
  const segments = route.segments || route.legs || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Dettagli del percorso</Text>
      <Divider style={styles.divider} />

      {segments.map((seg: any, i: number) => {
        const mode = seg.mode || seg.transport || "walk";
        const isWalk = mode.toLowerCase() === "walk";
        const color = isWalk ? "#757575" : "#1976D2";

        const fromName = seg.from?.name || seg.from?.stop_name || seg.from?.street || "Punto di partenza";
        const toName = seg.to?.name || seg.to?.stop_name || seg.to?.street || "Punto di arrivo";

        return (
          <View key={i} style={styles.segment}>
            <View style={styles.bulletContainer}>
              <View style={[styles.bullet, { backgroundColor: color }]} />
              {i < segments.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.modeText, { color }]}>
                {isWalk ? "A piedi" : mode.toUpperCase()}
              </Text>
              {seg.name && <Text style={styles.detail}>{seg.name}</Text>}
              <Text style={styles.detail}>
                Da: <Text style={styles.bold}>{fromName}</Text>
              </Text>
              <Text style={styles.detail}>
                A: <Text style={styles.bold}>{toName}</Text>
              </Text>
              {seg.duration && (
                <Text style={styles.duration}>
                  Durata: {(seg.duration / 60).toFixed(0)} min
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 10,
  },
  segment: {
    flexDirection: "row",
    marginBottom: 16,
  },
  bulletContainer: {
    alignItems: "center",
    marginRight: 10,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#ccc",
    marginVertical: 4,
  },
  textContainer: {
    flex: 1,
  },
  modeText: {
    fontWeight: "600",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  bold: {
    fontWeight: "600",
  },
  duration: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
  },
});
