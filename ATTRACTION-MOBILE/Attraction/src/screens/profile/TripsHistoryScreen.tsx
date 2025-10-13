import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  RefreshControl,
  Pressable,
  ViewToken,
} from "react-native";
import {
  Text,
  useTheme,
  ActivityIndicator,
  IconButton,
  Chip,
  Searchbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../navigation/types";
import { useGetSearchesQuery } from "../../store/api/searchApi";
import { reverseGeocode as reverseGeocodeUtil } from "../../utils/reverseGeocode";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

type Props = NativeStackScreenProps<ProfileStackParamList, "TripsHistory">;
type FilterMode = "all" | "bus" | "metro" | "train" | "bike";
type SortBy = "recent" | "oldest" | "distance";

const PAGE_SIZE = 48;
const VISIBLE_GEOCODE_BATCH = 8;
const GEOCODE_CACHE_PRECISION = 4;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function normalizeModeLabel(modesRaw: string): "bus" | "metro" | "train" | "bike" | "walk" | "other" {
  const m = (modesRaw || "").toLowerCase();
  if (m.includes("subway") || m.includes("metro")) return "metro";
  if (m.includes("train")) return "train";
  if (m.includes("bicycle") || m.includes("bike")) return "bike";
  if (m.includes("bus")) return "bus";
  if (m.includes("walk")) return "walk";
  return "other";
}
function getModeIcon(mode: string): string {
  const m = normalizeModeLabel(mode);
  if (m === "bus") return "🚌";
  if (m === "metro") return "🚇";
  if (m === "train") return "🚆";
  if (m === "bike") return "🚴";
  if (m === "walk") return "🚶";
  return "🚗";
}
const round = (n: number) => Number(n.toFixed(GEOCODE_CACHE_PRECISION));
const coordKey = (lat: number, lon: number) => `${round(lat)},${round(lon)}`;
const formatLatLon = (lat: number, lon: number) => `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
const isCoordFallback = (s?: string) => !!s && /-?\d+\.\d+,\s*-?\d+\.\d+/.test(s);

export default function TripsHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: allSearches = [], isLoading, isError, refetch, isFetching } = useGetSearchesQuery();

  // ---- state/filters ----
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<FilterMode>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"start" | "end">("start");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // ---- caches/queues ----
  const [resolvedNames, setResolvedNames] = useState<Record<string, { from: string; to: string }>>({});
  const geocodeCacheRef = useRef<Map<string, string>>(new Map());
  const queueRef = useRef<Set<string>>(new Set());
  const geocodingBusyRef = useRef(false);
  const retriedOnceRef = useRef<Set<string>>(new Set());

  // ---- derive list ----
  const filteredTrips = useMemo(() => {
    let trips = allSearches
      .filter((s) => s.from_lat !== 0 && s.to_lat !== 0)
      .map((s) => ({ ...s, tripDate: new Date(s.trip_date) }))
      .filter((trip) => {
        if (trip.tripDate < dateRange.start || trip.tripDate > dateRange.end) return false;
        if (selectedMode !== "all") {
          const normal = normalizeModeLabel(trip.modes);
          if (normal !== selectedMode) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const rn = resolvedNames[String(trip.id)];
          const fromName = (rn?.from ?? "").toLowerCase();
          const toName = (rn?.to ?? "").toLowerCase();
          if (!fromName.includes(q) && !toName.includes(q)) {
            const coordsFrom = formatLatLon(trip.from_lat, trip.from_lon).toLowerCase();
            const coordsTo = formatLatLon(trip.to_lat, trip.to_lon).toLowerCase();
            if (!coordsFrom.includes(q) && !coordsTo.includes(q)) return false;
          }
        }
        return true;
      });

    switch (sortBy) {
      case "oldest":
        trips.sort((a, b) => a.tripDate.getTime() - b.tripDate.getTime());
        break;
      case "distance":
        trips.sort((a, b) => {
          const da = calculateDistance(a.from_lat, a.from_lon, a.to_lat, a.to_lon);
          const db = calculateDistance(b.from_lat, b.from_lon, b.to_lat, b.to_lon);
          return db - da;
        });
        break;
      case "recent":
      default:
        trips.sort((a, b) => b.tripDate.getTime() - a.tripDate.getTime());
    }
    return trips;
  }, [allSearches, selectedMode, sortBy, searchQuery, dateRange, resolvedNames]);

  const paginatedTrips = useMemo(
    () => filteredTrips.slice(0, (pageIndex + 1) * PAGE_SIZE),
    [filteredTrips, pageIndex]
  );
  const hasMore = filteredTrips.length > (pageIndex + 1) * PAGE_SIZE;

  // ---- geocoding helpers (hooks BEFORE any return) ----
  const reverseWithCache = useCallback(async (lat: number, lon: number) => {
    const key = coordKey(lat, lon);
    const cached = geocodeCacheRef.current.get(key);
    if (cached) return cached;
    const name = await reverseGeocodeUtil(lat, lon);
    if (name) geocodeCacheRef.current.set(key, name);
    return name;
  }, []);

  const pumpGeocode = useCallback(async () => {
    if (geocodingBusyRef.current) return;
    geocodingBusyRef.current = true;
    try {
      while (queueRef.current.size > 0) {
        const ids = Array.from(queueRef.current).slice(0, VISIBLE_GEOCODE_BATCH);
        ids.forEach((id) => queueRef.current.delete(id));

        const lookedUp = await Promise.all(
          ids.map(async (id) => {
            const item =
              paginatedTrips.find((t) => String(t.id) === id) ||
              filteredTrips.find((t) => String(t.id) === id);
            if (!item) return null;

            const [fromName, toName] = await Promise.all([
              reverseWithCache(item.from_lat, item.from_lon).catch(() => null),
              reverseWithCache(item.to_lat, item.to_lon).catch(() => null),
            ]);

            return [
              id,
              {
                from: fromName || formatLatLon(item.from_lat, item.from_lon),
                to: toName || formatLatLon(item.to_lat, item.to_lon),
              },
            ] as const;
          })
        );

        const next: Record<string, { from: string; to: string }> = {};
        lookedUp.forEach((p) => {
          if (p) next[p[0]] = p[1];
        });
        if (Object.keys(next).length) setResolvedNames((prev) => ({ ...prev, ...next }));

        await new Promise((r) => setTimeout(r, 0)); // yield
      }
    } finally {
      geocodingBusyRef.current = false;
    }
  }, [filteredTrips, paginatedTrips, reverseWithCache]);

  const scheduleGeocode = useCallback(
    (ids: string[]) => {
      let added = false;
      for (const id of ids) {
        const rn = resolvedNames[id];
        if (!rn) {
          queueRef.current.add(id);
          added = true;
        } else if (!retriedOnceRef.current.has(id) && (isCoordFallback(rn.from) || isCoordFallback(rn.to))) {
          retriedOnceRef.current.add(id);
          queueRef.current.add(id);
          added = true;
        }
      }
      if (added) pumpGeocode();
    },
    [resolvedNames, pumpGeocode]
  );

  useEffect(() => {
    if (paginatedTrips.length === 0) return;
    const firstIds = paginatedTrips.slice(0, Math.min(paginatedTrips.length, VISIBLE_GEOCODE_BATCH)).map((t) => String(t.id));
    scheduleGeocode(firstIds);
  }, [paginatedTrips, scheduleGeocode]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const ids = viewableItems
        .map((v) => v.item?.id)
        .filter((id) => id != null)
        .map((id) => String(id));
      scheduleGeocode(ids);
    },
    [scheduleGeocode]
  );

  const handleDateChange = useCallback((field: "start" | "end", date: Date) => {
    setDateRange((prev) => ({ ...prev, [field]: date }));
    setShowDatePicker(false);
    setPageIndex(0);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedMode("all");
    setSortBy("recent");
    setDateRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });
    setPageIndex(0);
  }, []);

  const onSelectTrip = useCallback(
    (item: any) => {
      navigation.getParent()?.navigate("HomeTab" as never, {
        screen: "Results",
        params: { searchId: item.id },
      } as never);
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => String(item.id), []);
  const ITEM_HEIGHT = 116;
  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    []
  );

  // 🔒 IMPORTANT: anche questo hook prima di qualsiasi return
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const id = String(item.id);
      const rn = resolvedNames[id];
      const from = rn?.from || formatLatLon(item.from_lat, item.from_lon);
      const to = rn?.to || formatLatLon(item.to_lat, item.to_lon);

      if ((isCoordFallback(from) || isCoordFallback(to)) && !retriedOnceRef.current.has(id)) {
        retriedOnceRef.current.add(id);
        scheduleGeocode([id]);
      }

      const date = new Date(item.trip_date);
      const distanceKm = calculateDistance(item.from_lat, item.from_lon, item.to_lat, item.to_lon);
      const mode = normalizeModeLabel(item.modes);
      const modeEmoji = getModeIcon(item.modes);
      const modeColor =
        mode === "bus"
          ? theme.colors.primary
          : mode === "metro"
          ? theme.colors.secondary
          : mode === "train"
          ? theme.colors.tertiary ?? theme.colors.primary
          : mode === "bike"
          ? "#FF6B6B"
          : theme.colors.onSurfaceVariant;

      return (
        <Pressable
          onPress={() => {
            scheduleGeocode([id]);
            onSelectTrip(item);
          }}
          android_ripple={{ borderless: false }}
          accessibilityRole="button"
          accessibilityLabel={`Tratta da ${from} a ${to}`}
          accessibilityHint="Apri i dettagli tratta"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.backgroundCard ?? theme.colors.surface,
              borderColor: "transparent",
            },
            Platform.select({
              ios: styles.iosShadow,
              android: { elevation: 4 },
            }),
          ] as any}
          hitSlop={8}
        >
          <View style={styles.topRow}>
            <View style={[styles.modePill, { borderColor: modeColor + "55" }]}>
              <Text style={styles.modeEmoji}>{modeEmoji}</Text>
              <Text style={[styles.modeText, { color: modeColor }]}>{item.modes?.toUpperCase?.() ?? "—"}</Text>
            </View>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {date.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </Text>
            <IconButton icon="chevron-right" size={22} iconColor={theme.colors.onSurfaceVariant} />
          </View>

          <View style={styles.routeBox}>
            <Text numberOfLines={1} style={[styles.routeLine, { color: theme.colors.onSurface }]}>
              <Text style={[styles.routeLabel, { color: theme.colors.onSurfaceVariant }]}>Da: </Text>
              {from}
            </Text>
            <Text numberOfLines={1} style={[styles.routeLine, { color: theme.colors.onSurface }]}>
              <Text style={[styles.routeLabel, { color: theme.colors.onSurfaceVariant }]}>A: </Text>
              {to}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={[styles.chipSoft, { borderColor: modeColor + "55" }]}>
              <Text style={[styles.chipText, { color: modeColor }]}>~ {distanceKm.toFixed(1)} km</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [resolvedNames, scheduleGeocode, onSelectTrip, theme.colors]
  );

  // ---- header (JSX, nessun hook) ----
  const ListHeader = (
    <View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Cerca per luogo…"
          onChangeText={(text) => {
            setSearchQuery(text);
            setPageIndex(0);
          }}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
          returnKeyType="search"
          inputStyle={{ minHeight: 44 }}
          accessibilityLabel="Cerca nello storico"
        />
      </View>

      <View
        style={[
          styles.filtersBar,
          { backgroundColor: theme.colors.surface, borderColor: (theme.colors.outline ?? "#000") + "33" },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.count, { color: theme.colors.onSurface }]}>{filteredTrips.length}</Text>
          <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
            {selectedMode === "all" ? "Tutte le modalità"
              : selectedMode === "bus" ? "Bus"
              : selectedMode === "metro" ? "Metro"
              : selectedMode === "train" ? "Treno"
              : "Bici"} · {sortBy === "recent" ? "Recenti" : sortBy === "oldest" ? "Vecchi" : "Lunghi"} ·{" "}
            {dateRange.start.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} —{" "}
            {dateRange.end.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
          </Text>
        </View>

        <TouchableOpacity onPress={resetFilters} style={styles.actionBtn} accessibilityRole="button">
          <Text style={[styles.actionText, { color: theme.colors.error }]}>Reset</Text>
        </TouchableOpacity>
        <IconButton
          icon="tune-variant"
          size={22}
          onPress={() => setFiltersOpen((v) => !v)}
          accessibilityLabel="Apri/chiudi filtri"
          iconColor={filtersOpen ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
      </View>

      <View style={styles.quickChips}>
        {(["all", "bus", "metro", "train", "bike"] as FilterMode[]).map((mode) => (
          <Chip
            key={mode}
            selected={selectedMode === mode}
            onPress={() => {
              setSelectedMode(mode);
              setPageIndex(0);
            }}
            style={[styles.chip, selectedMode === mode && { backgroundColor: theme.colors.primary }]}
            textStyle={{
              color: selectedMode === mode ? theme.colors.onPrimary : theme.colors.onSurface,
              fontWeight: "700",
              fontSize: 12,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Filtro modalità ${mode}`}
          >
            {mode === "all" ? "Tutte" : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Chip>
        ))}
      </View>

      {filtersOpen && (
        <View style={[styles.filterPanel, { backgroundColor: theme.colors.surface }]} accessibilityLabel="Pannello filtri">
          <View style={styles.filterSection}>
            <Text variant="titleSmall" style={[styles.filterLabel, { color: theme.colors.onSurface }]}>
              Ordina per
            </Text>
            <View style={styles.sortContainer}>
              {(["recent", "oldest", "distance"] as SortBy[]).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortOption,
                    sortBy === sort && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    setSortBy(sort);
                    setPageIndex(0);
                  }}
                >
                  <Text style={[styles.sortText, { color: sortBy === sort ? theme.colors.onPrimary : theme.colors.onSurface }]}>
                    {sort === "recent" ? "Più recenti" : sort === "oldest" ? "Più vecchi" : "Più lunghi"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text variant="titleSmall" style={[styles.filterLabel, { color: theme.colors.onSurface }]}>
              Intervallo date
            </Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={() => {
                  setDatePickerMode("start");
                  setShowDatePicker(true);
                }}
              >
                <Text style={[styles.dateButtonText, { color: theme.colors.onPrimaryContainer }]}>
                  Da: {dateRange.start.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={() => {
                  setDatePickerMode("end");
                  setShowDatePicker(true);
                }}
              >
                <Text style={[styles.dateButtonText, { color: theme.colors.onPrimaryContainer }]}>
                  A: {dateRange.end.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={datePickerMode === "start" ? dateRange.start : dateRange.end}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  if (selectedDate) handleDateChange(datePickerMode, selectedDate);
                }}
              />
            )}
          </View>

          <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.colors.error }]} onPress={resetFilters}>
            <Text style={[styles.resetButtonText, { color: theme.colors.onError }]}>Azzera filtri</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeFiltersBtn} onPress={() => setFiltersOpen(false)}>
            <Text style={{ fontWeight: "700", color: theme.colors.primary }}>Chiudi filtri</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ---- render dispatch: UN solo return, nessun hook dopo ----
  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>Caricamento storico…</Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View style={styles.loaderContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.error }]}>Errore nel caricamento delle tratte</Text>
        <TouchableOpacity onPress={refetch} style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: theme.colors.onPrimary, fontWeight: "700" }}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={paginatedTrips}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
              setPageIndex(0);
            }}
          />
        }
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasMore) setPageIndex((p) => p + 1);
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>Nessuna tratta trovata</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant, opacity: 0.7 }]}>
              Prova a modificare i filtri
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadMoreText, { color: theme.colors.onSurfaceVariant }]}>Carico altre tratte…</Text>
            </View>
          ) : null
        }
      />
    );
  }

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 15, fontWeight: "500" },
  retryBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },

  searchContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchbar: { borderRadius: 12 },

  filtersBar: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: { fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 2, fontSize: 12 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  actionText: { fontSize: 12, fontWeight: "700" },

  quickChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  chip: { borderRadius: 20 },

  filterPanel: { marginTop: 8, marginHorizontal: 16, borderRadius: 12, padding: 16 },
  filterSection: { marginBottom: 24 },
  filterLabel: { fontWeight: "600", marginBottom: 12 },
  sortContainer: { gap: 8 },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.1)", alignItems: "center" },
  sortText: { fontSize: 14, fontWeight: "500" },
  dateRangeContainer: { flexDirection: "row", gap: 12 },
  dateButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  dateButtonText: { fontSize: 13, fontWeight: "500" },
  resetButton: { paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  resetButtonText: { fontSize: 15, fontWeight: "600" },
  closeFiltersBtn: { alignItems: "center", paddingVertical: 10 },

  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iosShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  topRow: { flexDirection: "row", alignItems: "center" },
  modePill: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, borderWidth: 1, gap: 6, marginRight: 8, minHeight: 28 },
  modeEmoji: { fontSize: 18, lineHeight: 20 },
  modeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  date: { marginLeft: "auto", fontSize: 12 },

  routeBox: { marginTop: 12, gap: 6 },
  routeLabel: { fontSize: 12, fontWeight: "700" },
  routeLine: { fontSize: 14, fontWeight: "600" },

  footerRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  chipSoft: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  chipText: { fontSize: 12, fontWeight: "600" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 17, fontWeight: "600", marginBottom: 8 },
  emptySubtext: { fontSize: 14, fontStyle: "italic" },

  loadMoreContainer: { paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8 },
  loadMoreText: { fontSize: 12, fontWeight: "600" },
});




