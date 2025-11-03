import React, {useState, useEffect, useRef, useMemo, memo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Text, Surface, Menu, useTheme} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import MapView from '../../components/maps/MapView';
import {isPointInAnyFeature} from '../../utils/geoUtils';
import drtArea from '../../config/drtArea.json';
import scooters from '../../config/scooters.json';

const {height} = Dimensions.get('window');

const co2ByMode: Record<string, number> = {
  walk: 0,
  bike: 0,
  bus: 80,
  train: 41,
  tram: 35,
  car: 180,
  subway: 50,
  navetta: 0,
  scooter: 0,
};

const MODE_CONFIG: Record<
  string,
  {icon: string; color: string; label: string}
> = {
  walk: {icon: 'walk', color: '#4CAF50', label: 'A piedi'},
  bus: {icon: 'bus', color: '#2196F3', label: 'Bus'},
  train: {icon: 'train', color: '#FF6F00', label: 'Treno'},
  tram: {icon: 'tram', color: '#9E9E9E', label: 'Tram'},
  subway: {icon: 'subway-variant', color: '#E91E63', label: 'Metro'},
  car: {icon: 'car', color: '#424242', label: 'Auto'},
  bike: {icon: 'bike', color: '#8BC34A', label: 'Bici'},
  navetta: {icon: 'bus', color: '#E53935', label: 'Navetta Unical'},
  scooter: {icon: 'scooter', color: '#00BFA5', label: 'Monopattini Unical'},
};

const CompactRouteItem = memo(({item, onSelect, onDetails, selected}: any) => {
  const theme = useTheme();
  const firstLeg = item.legs?.[0];
  const lastLeg = item.legs?.[item.legs.length - 1];
  const startTime = firstLeg?.start_time ? new Date(firstLeg.start_time) : null;
  const endTime = lastLeg?.end_time ? new Date(lastLeg.end_time) : null;
  const segments = item.segments || item.legs || [];

  const totalDistance = segments.reduce(
    (sum: number, s: any) => sum + (Number(s.distance_m) || 0),
    0,
  );

  const estimatedCO2 = segments.reduce((sum: number, seg: any) => {
    const mode =
      seg.name === 'Navetta Unical'
        ? 'navetta'
        : seg.name === 'Monopattini Unical'
        ? 'scooter'
        : seg.mode?.toLowerCase() || 'walk';
    const factor = co2ByMode[mode] ?? 0;
    const dist = Number(seg.distance_m) || 0;
    return sum + (dist / 1000) * factor;
  }, 0);

  return (
    <Surface
      style={[
        styles.cardCompact,
        selected && {
          borderColor: theme.colors.primary,
          borderWidth: 1.5,
          elevation: 3,
        },
      ]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelect(item)}
          style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Text style={[styles.timeText, {color: theme.colors.onSurface}]}>
            {startTime && endTime
              ? `${startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} → ${endTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Orario N/D'}
          </Text>
          <Text
            style={[
              styles.durationText,
              {color: theme.colors.onSurfaceVariant},
            ]}>
            {item.duration} min
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDetails(item)}>
          <Icon
            name="chevron-right"
            size={28}
            color={
              selected ? theme.colors.primary : theme.colors.onSurfaceVariant
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentLine}>
        {segments.map((seg: any, i: number) => {
          const mode =
            seg.name === 'Navetta Unical'
              ? 'navetta'
              : seg.name === 'Monopattini Unical'
              ? 'scooter'
              : seg.mode?.toLowerCase() || 'walk';
          const config = MODE_CONFIG[mode] || MODE_CONFIG.walk;
          const isLast = i === segments.length - 1;
          const dist = (seg.distance_m / 1000).toFixed(1);
          const label =
            seg.name || (mode === 'walk' ? 'A piedi' : config.label);

          return (
            <View key={i} style={styles.segmentItem}>
              <View
                style={[styles.modeCircleBig, {backgroundColor: config.color}]}>
                <Icon name={config.icon} size={18} color="#fff" />
              </View>
              <Text
                style={[styles.segmentLabel, {color: theme.colors.onSurface}]}>
                {label}
              </Text>
              <Text
                style={[
                  styles.segmentDistance,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                {dist} km
              </Text>
              {!isLast && <View style={styles.segmentDivider} />}
            </View>
          );
        })}
      </View>

      <View style={styles.bottomInfoRow}>
        <Text style={[styles.infoText, {color: theme.colors.onSurfaceVariant}]}>
          {(totalDistance / 1000).toFixed(1)} km totali
        </Text>
        {estimatedCO2 > 0 && (
          <Text style={[styles.co2Text, {color: theme.colors.secondary}]}>
            {Math.round(estimatedCO2)} g CO₂
          </Text>
        )}
      </View>
    </Surface>
  );
});

export default function ResultsScreen({route}: any) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const {routes} = route.params;

  const [selectedRoute, setSelectedRoute] = useState(routes?.[0] || null);
  const [showDrtArea, setShowDrtArea] = useState(false);
  const [hasNavetta, setHasNavetta] = useState(false);
  const [hasScooters, setHasScooters] = useState(false);
  const [filterMode, setFilterMode] = useState<'fastest' | 'eco' | 'walk'>(
    'fastest',
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(
    () => [height * 0.25, height * 0.55, height * 0.85],
    [],
  );

  // 🔹 Attiva o disattiva area DRT in base alla rotta selezionata
  useEffect(() => {
    if (!selectedRoute) return;

    const normalize = (val: any) =>
      String(val || '')
        .trim()
        .toLowerCase();

    const isNavetta =
      normalize(selectedRoute.id) === 'navetta-unical' ||
      normalize(selectedRoute.name) === 'navetta unical' ||
      selectedRoute?.legs?.some?.(
        (l: any) => normalize(l?.name) === 'navetta unical',
      );

    const isScooter =
      normalize(selectedRoute.id) === 'scooter-unical' ||
      normalize(selectedRoute.name) === 'monopattini unical' ||
      selectedRoute?.legs?.some?.(
        (l: any) => normalize(l?.name) === 'monopattini unical',
      );

    setShowDrtArea(isNavetta);
    setHasNavetta(isNavetta);
    setHasScooters(isScooter);
  }, [selectedRoute]);

  useEffect(() => {
    const t = setTimeout(() => setShowSheet(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleOpenDetails = (trip: any) =>
    navigation.navigate('TripDetails', {trip});

  const sortedRoutes = useMemo(() => {
    if (!routes) return [];

    // Calcolo CO₂ per ogni rotta
    const withCO2 = routes.map((r: any) => {
      const totalCO2 = r.segments?.reduce((sum: number, seg: any) => {
        const mode =
          seg.name === 'Navetta Unical'
            ? 'navetta'
            : seg.name === 'Monopattini Unical'
            ? 'scooter'
            : seg.mode?.toLowerCase() || 'walk';
        const dist = Number(seg.distance_m) || 0;
        const factor = co2ByMode[mode] ?? 0;
        return sum + (dist / 1000) * factor;
      }, 0);
      return {...r, totalCO2};
    });

    // Duplico eventuale rotta "walk" per navetta e scooter (sempre)
    const walkRoute = withCO2.find((r: any) =>
      r.segments?.every((s: any) => s.mode === 'walk'),
    );

    if (walkRoute) {
      withCO2.unshift({
        ...walkRoute,
        id: 'navetta-unical',
        name: 'Navetta Unical',
        segments: walkRoute.segments.map((s: any) => ({
          ...s,
          mode: 'navetta',
          name: 'Navetta Unical',
        })),
        legs: walkRoute.legs.map((l: any) => ({
          ...l,
          type: 'bus',
          name: 'Navetta Unical',
        })),
      });

      withCO2.unshift({
        ...walkRoute,
        id: 'scooter-unical',
        name: 'Monopattini Unical',
        segments: walkRoute.segments.map((s: any) => ({
          ...s,
          mode: 'scooter',
          name: 'Monopattini Unical',
        })),
        legs: walkRoute.legs.map((l: any) => ({
          ...l,
          type: 'bike',
          name: 'Monopattini Unical',
        })),
      });
    }

    // Filtri attivi
    if (filterMode === 'eco') {
      return withCO2.sort((a, b) => a.totalCO2 - b.totalCO2);
    }

    if (filterMode === 'walk') {
      return withCO2.filter(r =>
        r.segments?.every((s: any) => s.mode === 'walk'),
      );
    }

    // Default = più veloce
    return withCO2.sort((a, b) => a.duration - b.duration);
  }, [routes, filterMode]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* MAPPA */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          route={selectedRoute}
          showStops
          showMarkers
          highlightColor={
            selectedRoute?.id === 'navetta-unical'
              ? '#E53935'
              : selectedRoute?.id === 'scooter-unical'
              ? '#00BFA5'
              : theme.colors.primary
          }
          drtArea={showDrtArea ? drtArea : null} // 👈 solo se selezionata Navetta
          scooters={hasScooters ? scooters : null}
        />
      </View>

      {/* BOTTOMSHEET */}
      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{backgroundColor: theme.colors.surface}}>
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, {color: theme.colors.onSurface}]}>
                {sortedRoutes.length} soluzioni trovate
              </Text>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}>
                    <Icon
                      name="filter-variant"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[styles.menuText, {color: theme.colors.primary}]}>
                      {filterMode === 'fastest'
                        ? 'Più veloce'
                        : filterMode === 'eco'
                        ? 'Eco'
                        : 'Solo a piedi'}
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
                    setFilterMode('fastest');
                    setMenuVisible(false);
                  }}
                  title="Più veloce"
                />
                <Menu.Item
                  onPress={() => {
                    setFilterMode('eco');
                    setMenuVisible(false);
                  }}
                  title="Eco-sostenibile"
                />
                <Menu.Item
                  onPress={() => {
                    setFilterMode('walk');
                    setMenuVisible(false);
                  }}
                  title="Solo a piedi"
                />
              </Menu>
            </View>

            {/* Banner Monopattini */}
            {hasScooters && (
              <View
                style={{
                  backgroundColor: 'rgba(0,191,165,0.1)',
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="scooter"
                  size={20}
                  color="#00BFA5"
                  style={{marginRight: 6}}
                />
                <Text style={{color: '#00BFA5', fontWeight: '600'}}>
                  Monopattini Unical disponibili nell’area
                </Text>
              </View>
            )}
            {/* Banner Navetta */}
            {hasNavetta && (
              <View
                style={{
                  backgroundColor: 'rgba(229,57,53,0.1)',
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="bus"
                  size={20}
                  color="#E53935"
                  style={{marginRight: 6}}
                />
                <Text style={{color: '#E53935', fontWeight: '600'}}>
                  Servizio serale attivo dalle 20:00 alle 23:45
                </Text>
              </View>
            )}

            <FlatList
              data={sortedRoutes}
              keyExtractor={(item, index) => `${item.id || index}`}
              renderItem={({item}) => (
                <CompactRouteItem
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
  mapContainer: {flex: 1},
  bottomSheetContent: {padding: 20},
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {fontSize: 16, fontWeight: '700'},
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(80,185,72,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  menuText: {fontSize: 13, marginHorizontal: 4, fontWeight: '500'},
  cardCompact: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeText: {fontSize: 15, fontWeight: '600'},
  durationText: {fontSize: 13, marginLeft: 8},
  segmentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  segmentItem: {alignItems: 'center', marginHorizontal: 6},
  modeCircleBig: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  segmentLabel: {fontSize: 11, fontWeight: '600', textAlign: 'center'},
  segmentDistance: {fontSize: 10, textAlign: 'center'},
  segmentDivider: {
    position: 'absolute',
    right: -20,
    top: 12,
    width: 28,
    height: 2,
    backgroundColor: '#ccc',
  },
  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  infoText: {fontSize: 12},
  co2Text: {fontSize: 12, fontWeight: '600'},
});
