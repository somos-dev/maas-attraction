import React, { useState, useEffect, memo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Divider,
  useTheme,
  Chip,
  Surface,
  Button,
} from "react-native-paper";
import MapView from "../../components/maps/MapView";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 🔹 Configurazione colori e icone per modalità
const MODE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  walk: { icon: "walk", color: "#9E9E9E", label: "A piedi" },
  bus: { icon: "bus", color: "#2196F3", label: "Bus" },
  train: { icon: "train", color: "#FF6F00", label: "Treno" },
  tram: { icon: "tram", color: "#4CAF50", label: "Tram" },
  subway: { icon: "subway-variant", color: "#E91E63", label: "Metro" },
  car: { icon: "car", color: "#424242", label: "Auto" },
  bike: { icon: "bike", color: "#8BC34A", label: "Bici" },
};

// 🔹 Component per singolo segmento
const SegmentChip = memo(({ mode, name, distance }: any) => {
  const config = MODE_CONFIG[mode.toLowerCase()] || MODE_CONFIG.walk;
  const distanceKm = Math.round(distance / 100) / 10;

  return (
    <Chip
      icon={config.icon}
      style={[styles.segmentChip, { borderColor: config.color }]}
      textStyle={{ fontSize: 12, color: config.color }}
      mode="outlined"
    >
      {config.label} {distanceKm > 0 ? `· ${distanceKm} km` : ""}
      {name ? ` (${name})` : ""}
    </Chip>
  );
});

// 🔹 Header compatto con info principali
const RouteHeader = memo(({ item, theme }: any) => {
  const totalMinutes = Math.round(item.duration);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;

  return (
    <View style={styles.headerRow}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{timeStr}</Text>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>

      <View style={styles.modesRow}>
        {[...new Set(item.segments?.map((s: any) => s.mode) || [])].map(
          (mode: string, i: number) => {
            const config = MODE_CONFIG[mode.toLowerCase()] || MODE_CONFIG.walk;
            return (
              <View
                key={i}
                style={[styles.modeIcon, { backgroundColor: config.color }]}
              >
                <Icon name={config.icon} size={16} color="#fff" />
              </View>
            );
          }
        )}
      </View>
    </View>
  );
});

// 🔹 Timeline dei segmenti
const SegmentTimeline = memo(({ segments }: any) => {
  if (!segments || segments.length === 0) return null;

  return (
    <View style={styles.timeline}>
      {segments.map((seg: any, i: number) => {
        const config = MODE_CONFIG[seg.mode.toLowerCase()] || MODE_CONFIG.walk;
        const isLast = i === segments.length - 1;

        return (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineIndicator}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: config.color },
                ]}
              >
                <Icon name={config.icon} size={12} color="#fff" />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    seg.mode === "walk" && styles.timelineLineDashed,
                    { backgroundColor: config.color },
                  ]}
                />
              )}
            </View>

            <View style={styles.timelineContent}>
              <Text style={styles.segmentMode}>{config.label}</Text>
              {seg.name && (
                <Text style={styles.segmentName}>{seg.name}</Text>
              )}
              <Text style={styles.segmentDistance}>
                {Math.round(seg.distance_m / 100) / 10} km
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});

// 🔹 Singola card percorso
const RouteItem = memo(({ item, onSelect, selected, onDetails }: any) => {
  const theme = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onSelect(item)}>
      <Surface
        style={[
          styles.card,
          selected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            elevation: 4,
          },
        ]}
        elevation={selected ? 0 : 2}
      >
        <RouteHeader item={item} theme={theme} />

        <Divider style={styles.divider} />

        <SegmentTimeline segments={item.segments} />

        {item.stops?.length > 0 && (
          <View style={styles.stopsInfo}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.stopText} numberOfLines={1}>
              {item.stops[0].name} → {item.stops[item.stops.length - 1].name}
            </Text>
          </View>
        )}

        {/* 🔹 Pulsante “Dettagli” */}
        <View style={styles.detailsButtonContainer}>
          <Button
            mode="contained"
            onPress={() => onDetails(item)}
            style={styles.detailsButton}
          >
            Dettagli
          </Button>
        </View>
      </Surface>
    </TouchableOpacity>
  );
});

export default function ResultsScreen({ route }: any) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { routes } = route.params;
  const [selectedRoute, setSelectedRoute] = useState<any | null>(
    routes?.[0] || null
  );
  const [mapHeight, setMapHeight] = useState(SCREEN_HEIGHT * 0.45);

  const handleOpenDetails = (trip: any) => {
  navigation.navigate("TripDetails", { trip }); 
};

  useEffect(() => {
    console.log("✅ Routes ricevute:", routes);
  }, [routes]);

  return (
    <View style={styles.container}>
      {/* Mappa con percorso selezionato */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {selectedRoute ? (
          <MapView
            route={selectedRoute}
            showStops={true}
            showMarkers={true}
            highlightColor={theme.colors.primary}
          />
        ) : (
          <View style={styles.emptyMapContainer}>
            <Icon name="map-outline" size={48} color="#ccc" />
            <Text style={styles.emptyMapText}>
              Seleziona un percorso per visualizzarlo
            </Text>
          </View>
        )}
      </View>

      {/* Indicatore per drag */}
      <View style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
      </View>

      {/* Lista percorsi */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {routes?.length || 0} {routes?.length === 1 ? "Soluzione" : "Soluzioni"}
          </Text>
        </View>

        <FlatList
          data={routes}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={({ item }) => (
            <RouteItem
              item={item}
              onSelect={setSelectedRoute}
              selected={item === selectedRoute}
              onDetails={handleOpenDetails}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Icon name="routes-clock" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nessuna soluzione trovata</Text>
              <Text style={styles.emptySubtext}>
                Prova a modificare i parametri di ricerca
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  mapContainer: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  emptyMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  emptyMapText: { marginTop: 12, color: "#999", fontSize: 14 },
  dragHandle: { alignItems: "center", paddingVertical: 8, backgroundColor: "#fff" },
  dragIndicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ddd" },
  listContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  listContent: { padding: 12, paddingBottom: 24 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeColumn: { flex: 1 },
  timeText: { fontSize: 20, fontWeight: "700", color: "#333" },
  distanceText: { fontSize: 13, color: "#666", marginTop: 2 },
  modesRow: { flexDirection: "row", gap: 6 },
  modeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { marginVertical: 12 },
  timeline: { marginTop: 4 },
  timelineItem: { flexDirection: "row", marginBottom: 12 },
  timelineIndicator: { alignItems: "center", marginRight: 12 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: { width: 3, flex: 1, minHeight: 20, marginVertical: 2 },
  timelineLineDashed: { opacity: 0.4 },
  timelineContent: { flex: 1, paddingTop: 2 },
  segmentMode: { fontSize: 14, fontWeight: "600", color: "#333" },
  segmentName: { fontSize: 13, color: "#666", marginTop: 2 },
  segmentDistance: { fontSize: 12, color: "#999", marginTop: 2 },
  segmentChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f5f5f5",
  },
  stopsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stopText: { marginLeft: 6, fontSize: 12, color: "#666", flex: 1 },
  detailsButtonContainer: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  detailsButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});
