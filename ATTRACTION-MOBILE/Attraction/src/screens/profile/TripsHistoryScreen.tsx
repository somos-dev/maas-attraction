import React, {useEffect, useMemo, useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  RefreshControl,
  Pressable,
  ViewToken,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  IconButton,
  Chip,
  Searchbar,
  Surface,
  Menu,
  Badge,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigation/types';
import {useGetSearchesQuery} from '../../store/api/searchApi';
import {reverseGeocode as reverseGeocodeUtil} from '../../utils/reverseGeocode';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<ProfileStackParamList, 'TripsHistory'>;
type FilterMode = 'all' | 'bus' | 'eco' | 'train' | 'bike';
type SortBy = 'recent' | 'oldest' | 'distance';

const PAGE_SIZE = 48;
const VISIBLE_GEOCODE_BATCH = 8;
const GEOCODE_CACHE_PRECISION = 4;

// ---- helpers
const round = (n: number) => Number(n.toFixed(GEOCODE_CACHE_PRECISION));
const coordKey = (lat: number, lon: number) => `${round(lat)},${round(lon)}`;
const formatLatLon = (lat: number, lon: number) =>
  `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
const isCoordFallback = (s?: string) =>
  !!s && /-?\d+\.\d+,\s*-?\d+\.\d+/.test(s);
const sortLabelIT = (s: SortBy) =>
  s === 'recent' ? 'Più recenti' : s === 'oldest' ? 'Più vecchi' : 'Più lunghi';
const chipLabelIT = (m: FilterMode) =>
  m === 'all'
    ? 'Tutte'
    : m === 'bus'
    ? 'Bus'
    : m === 'eco'
    ? 'Eco'
    : m === 'train'
    ? 'Treno'
    : 'Bici';
const selectedModeLabelIT = (mode: FilterMode) =>
  mode === 'all' ? 'Tutte le modalità' : chipLabelIT(mode);
const fmtDate = (d: Date) =>
  d.toLocaleString('it-IT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
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

// modalità → icona/label/colore (stile uniforme)
type NormalMode =
  | 'bus'
  | 'subway'
  | 'tram'
  | 'train'
  | 'bike'
  | 'walk'
  | 'car'
  | 'other';
const normalizeModeLabel = (modesRaw: string): NormalMode => {
  const m = (modesRaw || '').toLowerCase();
  if (m.includes('subway') || m.includes('metro')) return 'subway';
  if (m.includes('tram')) return 'tram';
  if (m.includes('train')) return 'train';
  if (m.includes('bicycle') || m.includes('bike')) return 'bike';
  if (m.includes('bus')) return 'bus';
  if (m.includes('walk')) return 'walk';
  if (m.includes('car') || m.includes('auto')) return 'car';
  return 'other';
};
const MODE_META: Record<
  NormalMode,
  {icon: string; label: string; color: string}
> = {
  bus: {icon: 'bus', label: 'Bus', color: '#2196F3'},
  subway: {icon: 'subway-variant', label: 'Metro', color: '#E91E63'},
  tram: {icon: 'tram', label: 'Tram', color: '#4CAF50'},
  train: {icon: 'train', label: 'Treno', color: '#FF6F00'},
  bike: {icon: 'bike', label: 'Bici', color: '#8BC34A'},
  walk: {icon: 'walk', label: 'A piedi', color: '#9E9E9E'},
  car: {icon: 'car', label: 'Auto', color: '#424242'},
  other: {icon: 'transit-connection-variant', label: 'Altro', color: '#6B7280'},
};
const getModeMeta = (raw: string) => MODE_META[normalizeModeLabel(raw)];
const ECO_SET = new Set<NormalMode>([
  'bus',
  'train',
  'bike',
  'walk',
  'subway',
  'tram',
]);
const isEcoMode = (raw: string) => ECO_SET.has(normalizeModeLabel(raw));

export default function TripsHistoryScreen({}: Props) {
  const theme = useTheme();
  const {
    data: allSearches = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetSearchesQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<FilterMode>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [menuVisible, setMenuVisible] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const navigation = useNavigation();

  // geocoding cache & queue
  const [resolvedNames, setResolvedNames] = useState<
    Record<string, {from: string; to: string}>
  >({});
  const geocodeCacheRef = useRef<Map<string, string>>(new Map());
  const queueRef = useRef<Set<string>>(new Set());
  const geocodingBusyRef = useRef(false);
  const retriedOnceRef = useRef<Set<string>>(new Set());

  // filtra + ordina
  const filteredTrips = useMemo(() => {
    let trips = allSearches
      .filter(s => s.from_lat !== 0 && s.to_lat !== 0)
      .map(s => ({...s, tripDate: new Date(s.trip_date)}))
      .filter(trip => {
        if (selectedMode !== 'all') {
          const norm = normalizeModeLabel(trip.modes);
          if (selectedMode === 'eco') {
            if (!isEcoMode(trip.modes)) return false;
          } else if (norm !== selectedMode) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const rn = resolvedNames[String(trip.id)];
          const fromName = (rn?.from ?? '').toLowerCase();
          const toName = (rn?.to ?? '').toLowerCase();
          if (!fromName.includes(q) && !toName.includes(q)) {
            const coordsFrom = formatLatLon(
              trip.from_lat,
              trip.from_lon,
            ).toLowerCase();
            const coordsTo = formatLatLon(
              trip.to_lat,
              trip.to_lon,
            ).toLowerCase();
            if (!coordsFrom.includes(q) && !coordsTo.includes(q)) return false;
          }
        }
        return true;
      });

    switch (sortBy) {
      case 'oldest':
        trips.sort((a, b) => a.tripDate.getTime() - b.tripDate.getTime());
        break;
      case 'distance':
        trips.sort((a, b) => {
          const da = calculateDistance(
            a.from_lat,
            a.from_lon,
            a.to_lat,
            a.to_lon,
          );
          const db = calculateDistance(
            b.from_lat,
            b.from_lon,
            b.to_lat,
            b.to_lon,
          );
          return db - da;
        });
        break;
      case 'recent':
      default:
        trips.sort((a, b) => b.tripDate.getTime() - a.tripDate.getTime());
    }
    return trips;
  }, [allSearches, selectedMode, sortBy, searchQuery, resolvedNames]);

  // paginazione
  const paginatedTrips = useMemo(
    () => filteredTrips.slice(0, (pageIndex + 1) * PAGE_SIZE),
    [filteredTrips, pageIndex],
  );
  const hasMore = filteredTrips.length > (pageIndex + 1) * PAGE_SIZE;

  // geocoding helpers
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
        const ids = Array.from(queueRef.current).slice(
          0,
          VISIBLE_GEOCODE_BATCH,
        );
        ids.forEach(id => queueRef.current.delete(id));

        const lookedUp = await Promise.all(
          ids.map(async id => {
            const item =
              paginatedTrips.find(t => String(t.id) === id) ||
              filteredTrips.find(t => String(t.id) === id);
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
          }),
        );

        const next: Record<string, {from: string; to: string}> = {};
        lookedUp.forEach(p => {
          if (p) next[p[0]] = p[1];
        });
        if (Object.keys(next).length)
          setResolvedNames(prev => ({...prev, ...next}));

        await new Promise(r => setTimeout(r, 0));
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
        } else if (
          !retriedOnceRef.current.has(id) &&
          (isCoordFallback(rn.from) || isCoordFallback(rn.to))
        ) {
          retriedOnceRef.current.add(id);
          queueRef.current.add(id);
          added = true;
        }
      }
      if (added) pumpGeocode();
    },
    [resolvedNames, pumpGeocode],
  );

  useEffect(() => {
    if (paginatedTrips.length === 0) return;
    const firstIds = paginatedTrips
      .slice(0, Math.min(paginatedTrips.length, VISIBLE_GEOCODE_BATCH))
      .map(t => String(t.id));
    scheduleGeocode(firstIds);
  }, [paginatedTrips, scheduleGeocode]);

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: Array<ViewToken>}) => {
      const ids = viewableItems
        .map(v => v.item?.id)
        .filter(id => id != null)
        .map(id => String(id as number));
      scheduleGeocode(ids);
    },
    [scheduleGeocode],
  );

  // perf FlatList
  const keyExtractor = useCallback((item: any) => String(item.id), []);
  const ITEM_HEIGHT = 138;
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  // ---------- CARD (Surface con background uguale a Results) ----------
  const TripsCard = React.memo(
    ({item}: {item: any}) => {
      const id = String(item.id);
      const rn = resolvedNames[id];
      const from = rn?.from || formatLatLon(item.from_lat, item.from_lon);
      const to = rn?.to || formatLatLon(item.to_lat, item.to_lon);
      const isLoadingGeo = !rn;

      if (
        (isCoordFallback(from) || isCoordFallback(to)) &&
        !retriedOnceRef.current.has(id)
      ) {
        retriedOnceRef.current.add(id);
        scheduleGeocode([id]);
      }

      const date = new Date(item.trip_date);
      const distanceKm = calculateDistance(
        item.from_lat,
        item.from_lon,
        item.to_lat,
        item.to_lon,
      );
      const meta = getModeMeta(item.modes);
      const eco = isEcoMode(item.modes);

      const scaleAnim = useRef(new Animated.Value(1)).current;
      const pressIn = () =>
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 50,
        }).start();
      const pressOut = () =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }).start();

      return (
        <Animated.View style={{transform: [{scale: scaleAnim}]}}>
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() =>
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              )
            }
            android_ripple={{borderless: false, color: meta.color + '22'}}
            style={{marginHorizontal: 16, marginBottom: 12}}
            accessibilityRole="button"
            accessibilityLabel={`Tratta ${meta.label} da ${from} a ${to}`}>
            <Surface
              elevation={2}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.backgroundCard, // <— stesso sfondo delle Results
                  borderColor: meta.color + '20',
                },
              ]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.modePill,
                    {backgroundColor: meta.color + '12'},
                  ]}>
                  <Icon name={meta.icon} size={18} color={meta.color} />
                  <Text style={[styles.modeText, {color: meta.color}]}>
                    {meta.label}
                  </Text>
                </View>

                <View style={styles.rightInfo}>
                  <View
                    style={[
                      styles.dateChip,
                      {backgroundColor: meta.color + '10'},
                    ]}>
                    <Text style={[styles.dateText, {color: meta.color}]}>
                      {fmtDate(date)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Rotta */}
              <View style={styles.routeContainer}>
                <View style={styles.routeRow}>
                  <View
                    style={[styles.routeDot, {backgroundColor: meta.color}]}
                  />
                  {isLoadingGeo ? (
                    <View style={styles.skeletonText} />
                  ) : (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.locationText,
                        {color: theme.colors.onSurface},
                      ]}>
                      {from}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.routeLine,
                    {backgroundColor: meta.color + '35'},
                  ]}
                />

                <View style={styles.routeRow}>
                  <View
                    style={[
                      styles.routeDot,
                      {
                        backgroundColor: meta.color,
                        borderWidth: 2,
                        borderColor: theme.colors.backgroundCard,
                      },
                    ]}
                  />
                  {isLoadingGeo ? (
                    <View style={[styles.skeletonText, {width: '70%'}]} />
                  ) : (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.locationText,
                        {color: theme.colors.onSurface},
                      ]}>
                      {to}
                    </Text>
                  )}
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View
                  style={[
                    styles.distancePill,
                    {backgroundColor: meta.color + '10'},
                  ]}>
                  <Text style={[styles.distanceText, {color: meta.color}]}>
                    📏 {distanceKm.toFixed(1)} km
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.statsBtn,
                    {backgroundColor: meta.color + '12'},
                  ]}
                  onPress={() =>
                    navigation.navigate('HomeTab', {
                      screen: 'Home',
                      params: {
                        prefill: {
                          from_lat: item.from_lat,
                          from_lon: item.from_lon,
                          to_lat: item.to_lat,
                          to_lon: item.to_lon,
                        },
                      },
                    })
                  }>
                  <Text style={[styles.statsText, {color: meta.color}]}>
                    Richiedi
                  </Text>
                  <Icon name="chevron-right" size={18} color={meta.color} />
                </TouchableOpacity>
              </View>
            </Surface>
          </Pressable>
        </Animated.View>
      );
    },
    (prev, next) =>
      prev.item.id === next.item.id &&
      resolvedNames[String(prev.item.id)] ===
        resolvedNames[String(next.item.id)],
  );

  const renderItem = useCallback(
    ({item}: {item: any}) => <TripsCard item={item} />,
    [resolvedNames, scheduleGeocode, theme.colors],
  );

  // ---------- Header lista: search + contatore + MENU ordinamento (stile Results) ----------
  const [anchorLayout, setAnchorLayout] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Cerca per luogo…"
            onChangeText={text => {
              setSearchQuery(text);
              setPageIndex(0);
            }}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={theme.colors.primary}
            returnKeyType="search"
            inputStyle={{minHeight: 44}}
            accessibilityLabel="Cerca nello storico"
          />
        </View>

        {/* Barra titolo + menu sort (dropdown come Results) */}
        <View
          style={[
            styles.listHeader,
            {borderBottomColor: (theme.colors.outline ?? '#eee') + '66'},
          ]}>
          <Text style={[styles.listTitle, {color: theme.colors.onSurface}]}>
            {filteredTrips.length} tratte trovate
          </Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onLayout={e => setAnchorLayout(e.nativeEvent.layout)}
                style={[
                  styles.menuButton,
                  {backgroundColor: theme.colors.primary + '12'},
                ]}
                onPress={() => setMenuVisible(true)}>
                <Icon
                  name="filter-variant"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.menuText, {color: theme.colors.primary}]}>
                  {sortLabelIT(sortBy)}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            }>
            <Menu.Item
              onPress={() => {
                setSortBy('recent');
                setPageIndex(0);
                setMenuVisible(false);
              }}
              title="🕒 Più recenti"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('oldest');
                setPageIndex(0);
                setMenuVisible(false);
              }}
              title="📅 Più vecchi"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('distance');
                setPageIndex(0);
                setMenuVisible(false);
              }}
              title="📏 Più lunghi"
            />
          </Menu>
        </View>

        {/* Chips modalità (restano, ma più compatti) */}
        <View style={styles.quickChips}>
          {(['all', 'bus', 'eco', 'train', 'bike'] as FilterMode[]).map(
            mode => {
              const selected = selectedMode === mode;
              return (
                <Chip
                  key={mode}
                  selected={selected}
                  onPress={() => {
                    setSelectedMode(mode);
                    setPageIndex(0);
                  }}
                  style={[
                    styles.chip,
                    selected && {backgroundColor: theme.colors.primary},
                  ]}
                  textStyle={{
                    color: selected
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                    fontWeight: '700',
                    fontSize: 12,
                  }}>
                  {chipLabelIT(mode)}
                </Chip>
              );
            },
          )}
        </View>
      </View>
    ),
    [
      filteredTrips.length,
      searchQuery,
      selectedMode,
      sortBy,
      theme.colors,
      menuVisible,
    ],
  );

  // ---------- contenuto ----------
  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.onSurface}]}>
          Caricamento storico…
        </Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View style={styles.loaderContainer}>
        <Text style={[styles.loadingText, {color: theme.colors.error}]}>
          Errore nel caricamento delle tratte
        </Text>
        <TouchableOpacity
          onPress={refetch}
          style={[styles.retryBtn, {backgroundColor: theme.colors.primary}]}>
          <Text style={{color: theme.colors.onPrimary, fontWeight: '700'}}>
            Riprova
          </Text>
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
        contentContainerStyle={{paddingBottom: 16}}
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
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasMore) setPageIndex(p => p + 1);
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{itemVisiblePercentThreshold: 50}}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              Nessuna tratta trovata
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                {color: theme.colors.onSurfaceVariant, opacity: 0.7},
              ]}>
              Prova a modificare i filtri
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                style={[
                  styles.loadMoreText,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                Carico altre tratte…
              </Text>
            </View>
          ) : null
        }
      />
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},

  // header + search
  searchContainer: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8},
  searchbar: {borderRadius: 12},

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  listTitle: {fontSize: 16, fontWeight: '700'},
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  menuText: {fontSize: 13, fontWeight: '600'},

  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {borderRadius: 20},

  // loading / error
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {fontSize: 15, fontWeight: '500'},
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  // card (Surface come Results)
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  modeText: {fontSize: 13, fontWeight: '700', letterSpacing: 0.3},
  ecoBadge: {marginLeft: 4},
  rightInfo: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dateChip: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
  dateText: {fontSize: 12, fontWeight: '600'},

  routeContainer: {marginVertical: 4},
  routeRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  routeDot: {width: 10, height: 10, borderRadius: 5},
  routeLine: {width: 3, height: 24, marginLeft: 3.5, marginVertical: 2},
  locationText: {fontSize: 15, fontWeight: '600', flex: 1},
  skeletonText: {
    height: 16,
    width: '80%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  distancePill: {paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10},
  distanceText: {fontSize: 12, fontWeight: '700'},
  statsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  statsText: {fontSize: 13, fontWeight: '700'},

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {fontSize: 17, fontWeight: '600', marginBottom: 8},
  emptySubtext: {fontSize: 14, fontStyle: 'italic'},

  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadMoreText: {fontSize: 12, fontWeight: '600'},
});
