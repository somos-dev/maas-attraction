// src/screens/main/ResultsScreen.tsx
import React, { useState, useEffect, memo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card } from "react-native-paper";
import MapView from "../../components/maps/MapView";

// 🔹 Item memoizzato → riduce i re-render
const RouteItem = memo(({ item, onSelect }: any) => (
  <Card style={styles.card} onPress={() => onSelect(item)}>
    <Card.Title
      title={`${item.mode.toUpperCase()} - ${item.duration} min`}
      subtitle={`${item.distance} km`}
    />
    {item.segments?.length > 0 && (
      <View style={styles.segments}>
        {item.segments.map((seg: any, i: number) => (
          <Text key={i} style={styles.segmentText}>
            {seg.mode.toUpperCase()} →{" "}
            {Math.round((seg.distance_m / 1000) * 10) / 10} km
          </Text>
        ))}
      </View>
    )}
  </Card>
));

export default function ResultsScreen({ route }: any) {
  const { routes } = route.params;
  const [selectedRoute, setSelectedRoute] = useState<any | null>(
    routes?.[0] || null
  );

  useEffect(() => {
    console.log("✅ Routes ricevute:", routes);
  }, [routes]);

  return (
    <View style={styles.container}>
      {/* Mappa */}
      <View style={styles.mapContainer}>
        {selectedRoute && <MapView route={selectedRoute} />}
      </View>

      {/* Lista percorsi */}
      <View style={styles.listContainer}>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RouteItem item={item} onSelect={setSelectedRoute} />
          )}
          ListEmptyComponent={<Text>Nessuna soluzione trovata</Text>}
          initialNumToRender={3} // 🔹 carica solo i primi 3 item
          windowSize={5} // 🔹 mantiene poche schermate in memoria
          removeClippedSubviews={true} // 🔹 rimuove item non visibili
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  listContainer: { flex: 1, padding: 8 },
  card: { marginBottom: 8, borderRadius: 8 },
  segments: { padding: 8 },
  segmentText: { fontSize: 12, color: "#555" },
});

