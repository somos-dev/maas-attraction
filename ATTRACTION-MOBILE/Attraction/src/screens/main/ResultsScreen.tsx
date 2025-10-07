import React, { useState, useEffect, memo, useRef, useMemo } from "react";
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
  Divider,
  useTheme,
  Surface,
  Button,
} from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import MapView from "../../components/maps/MapView";

const { height } = Dimensions.get("window");

const MODE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  walk: { icon: "walk", color: "#9E9E9E", label: "A piedi" },
  bus: { icon: "bus", color: "#2196F3", label: "Bus" },
  train: { icon: "train", color: "#FF6F00", label: "Treno" },
  tram: { icon: "tram", color: "#4CAF50", label: "Tram" },
  subway: { icon: "subway-variant", color: "#E91E63", label: "Metro" },
  car: { icon: "car", color: "#424242", label: "Auto" },
  bike: { icon: "bike", color: "#8BC34A", label: "Bici" },
};

// Timeline dei segmenti
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
              <View style={[styles.timelineDot, { backgroundColor: config.color }]}>
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
              {seg.name && <Text style={styles.segmentName}>{seg.name}</Text>}
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

// Card singola rotta
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
        <View style={styles.headerRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeText}>{item.duration} min</Text>
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(() => [height * 0.25, height * 0.55, height * 0.85], []);

  // ✅ Mostra la BottomSheet solo dopo che la mappa è stabile
  const [showSheet, setShowSheet] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShowSheet(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleOpenDetails = (trip: any) => {
    navigation.navigate("TripDetails", { trip });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Mappa sotto */}
      <View style={styles.mapContainer} pointerEvents="box-none">
        <MapView
          ref={mapRef}
          route={selectedRoute}
          showStops
          showMarkers
          highlightColor={theme.colors.primary}
        />
      </View>

      {/* BottomSheet sopra - montata dopo 300ms */}
      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          enablePanDownToClose={false}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {routes?.length || 0}{" "}
                {routes?.length === 1 ? "Soluzione trovata" : "Soluzioni trovate"}
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
              scrollEnabled={false}
            />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, zIndex: 0 },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetContent: { padding: 16 },
  listHeader: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  listTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
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
  stopsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stopText: { marginLeft: 6, fontSize: 12, color: "#666", flex: 1 },
  detailsButtonContainer: { alignItems: "flex-end", marginTop: 12 },
  detailsButton: { borderRadius: 24, paddingHorizontal: 16 },
});
