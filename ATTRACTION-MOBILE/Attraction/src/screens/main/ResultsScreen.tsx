import React, { useState, useEffect, memo, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Text, Divider, useTheme, Surface, Menu } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import MapView from "../../components/maps/MapView";
import AppButton from "../../components/common/button/AppButton";

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

const co2ByMode: Record<string, number> = {
  walk: 0,
  bike: 0,
  bus: 80,
  train: 41,
  tram: 35,
  car: 180,
  subway: 50,
};

// Timeline dei segmenti
const SegmentTimeline = memo(({ segments }: any) => {
  if (!segments || segments.length === 0) return null;
  return (
    <View style={styles.timeline}>
      {segments.map((seg: any, i: number) => {
        const config = MODE_CONFIG[seg.mode?.toLowerCase()] || MODE_CONFIG.walk;
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
                {((seg.distance_m || 0) / 1000).toFixed(1)} km
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

  const firstLeg = item.legs?.[0];
  const lastLeg = item.legs?.[item.legs.length - 1];
  const startTime = firstLeg?.start_time ? new Date(firstLeg.start_time) : null;
  const endTime = lastLeg?.end_time ? new Date(lastLeg.end_time) : null;

  const segments = item.segments || item.legs || [];

  const totalDistance = segments.reduce(
    (sum: number, s: any) => sum + (Number(s.distance_m) || 0),
    0
  );
  const walkDistance = segments
    .filter((s: any) => s.mode?.toLowerCase() === "walk")
    .reduce((sum: number, s: any) => sum + (Number(s.distance_m) || 0), 0);

  const estimatedCO2 = segments.reduce((sum: number, seg: any) => {
    const mode = seg.mode?.toLowerCase() || "walk";
    const factor = co2ByMode[mode] ?? 0;
    const dist = Number(seg.distance_m) || 0;
    return sum + (dist / 1000) * factor;
  }, 0);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onSelect(item)}>
      <Surface
        style={[
          styles.card,
          { backgroundColor: theme.colors.backgroundCard },
          selected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            elevation: 4,
          },
        ]}
      >
        {/* Header con orari e durata */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {startTime && endTime ? (
              <Text style={[styles.timeText, { color: theme.colors.onSurface }]}>
                🕒{" "}
                {startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                →{" "}
                {endTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            ) : (
              <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                Orario non disponibile
              </Text>
            )}
            <Text style={[styles.distanceText, { color: theme.colors.onSurfaceVariant }]}>
              {item.duration} min totali
            </Text>
          </View>

          {/* Icone mezzi */}
          <View style={styles.modesRow}>
            {[...new Set(segments.map((s: any) => s.mode) || [])].map(
              (mode: string, i: number) => {
                const config = MODE_CONFIG[mode?.toLowerCase()] || MODE_CONFIG.walk;
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

        {/* Info */}
        <View style={styles.infoRow}>
          <View>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              🚶‍♂️ {(walkDistance / 1000).toFixed(1)} km a piedi
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              📏 {(totalDistance / 1000).toFixed(1)} km totali
            </Text>
          </View>

          {estimatedCO2 > 0 && (
            <View style={[styles.co2Badge, { backgroundColor: theme.colors.secondary + "20" }]}>
              <Icon name="leaf" size={14} color={theme.colors.primary} />
              <Text style={[styles.co2Text, { color: theme.colors.primary }]}>
                {Math.round(estimatedCO2)} g CO₂
              </Text>
            </View>
          )}
        </View>

        <SegmentTimeline segments={segments} />

        <View style={styles.detailsButtonContainer}>
          <AppButton
            label="Dettagli"
            onPress={() => onDetails(item)}
            style={styles.detailsButton}
          />
        </View>
      </Surface>
    </TouchableOpacity>
  );
});

export default function ResultsScreen({ route }: any) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { routes } = route.params;
  const [selectedRoute, setSelectedRoute] = useState<any | null>(routes?.[0] || null);

  const [filterMode, setFilterMode] = useState<"fastest" | "eco" | "walk">("fastest");
  const [menuVisible, setMenuVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(() => [height * 0.25, height * 0.55, height * 0.85], []);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSheet(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleOpenDetails = (trip: any) => {
    navigation.navigate("TripDetails", { trip });
  };

  // 🧠 Ordinamento e filtraggio
  const sortedRoutes = useMemo(() => {
    if (!routes) return [];

    const withCO2 = routes.map((r: any) => {
      const totalCO2 = r.segments?.reduce((sum: number, seg: any) => {
        const mode = seg.mode?.toLowerCase();
        const dist = Number(seg.distance_m) || 0;
        const factor = co2ByMode[mode] ?? 0;
        return sum + (dist / 1000) * factor;
      }, 0);
      return { ...r, totalCO2 };
    });

    if (filterMode === "eco") {
      return withCO2
        .sort((a, b) => {
          const aEco = !a.segments?.some((s: any) => s.mode === "car");
          const bEco = !b.segments?.some((s: any) => s.mode === "car");
          if (aEco !== bEco) return aEco ? -1 : 1; // eco first
          return (a.totalCO2 || Infinity) - (b.totalCO2 || Infinity);
        });
    }

    if (filterMode === "walk") {
      //  Mostra solo percorsi completamente pedonali
      return withCO2.filter((r) => r.segments?.every((s: any) => s.mode === "walk"));
    }

    // Default: più veloce
    return withCO2.sort((a, b) => a.duration - b.duration);
  }, [routes, filterMode]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Mappa */}
      <View style={styles.mapContainer} pointerEvents="box-none">
        <MapView
          ref={mapRef}
          route={selectedRoute}
          showStops
          showMarkers
          highlightColor={theme.colors.primary}
        />
      </View>

      {/* BottomSheet */}
      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: theme.colors.surface }]}
        >
          <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
            {/* Header con menu */}
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: theme.colors.onSurface }]}>
                {sortedRoutes.length} soluzioni trovate
              </Text>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                  >
                    <Icon name="filter-variant" size={20} color={theme.colors.primary} />
                    <Text style={[styles.menuText, { color: theme.colors.primary }]}>
                      {filterMode === "fastest"
                        ? "Più veloce"
                        : filterMode === "eco"
                        ? "Eco-sostenibile"
                        : "Solo a piedi"}
                    </Text>
                    <Icon name="chevron-down" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                }
              >
                <Menu.Item onPress={() => { setFilterMode("fastest"); setMenuVisible(false); }} title="🏃‍♂️ Più veloce" />
                <Menu.Item onPress={() => { setFilterMode("eco"); setMenuVisible(false); }} title="🌱 Eco-sostenibile" />
                <Menu.Item onPress={() => { setFilterMode("walk"); setMenuVisible(false); }} title="🚶‍♀️ Solo a piedi" />
              </Menu>
            </View>

            <FlatList
              data={sortedRoutes}
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
  bottomSheetBackground: { borderRadius: 20, elevation: 5 },
  bottomSheetContent: { padding: 16 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  listTitle: { fontSize: 16, fontWeight: "700" },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(80, 185, 72, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  menuText: {
    fontSize: 13,
    marginHorizontal: 4,
    fontWeight: "500",
  },
  card: { marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "transparent" },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  timeText: { fontSize: 14, fontWeight: "600" },
  distanceText: { fontSize: 12 },
  modesRow: { flexDirection: "row", gap: 6 },
  modeIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  divider: { marginVertical: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoText: { fontSize: 12 },
  co2Badge: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  co2Text: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  timeline: { marginTop: 4 },
  timelineItem: { flexDirection: "row", marginBottom: 12 },
  timelineIndicator: { alignItems: "center", marginRight: 12 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  timelineLine: { width: 3, flex: 1, minHeight: 20 },
  timelineLineDashed: { opacity: 0.4 },
  timelineContent: { flex: 1 },
  segmentMode: { fontSize: 14, fontWeight: "600" },
  segmentName: { fontSize: 13 },
  segmentDistance: { fontSize: 12, color: "#999" },
  detailsButtonContainer: { alignItems: "flex-end", marginTop: 8 },
  detailsButton: { marginTop: 6 },
});


