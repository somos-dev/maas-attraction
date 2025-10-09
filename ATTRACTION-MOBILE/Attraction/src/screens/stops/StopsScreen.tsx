// src/screens/services/StopsScreen.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Menu,
  Button,
  Chip,
  TouchableRipple,
} from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import MapStopsView from '../../components/maps/MapStopsView';

const {height} = Dimensions.get('window');
const CONTROL_HEIGHT = 40;

const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

const STOPS_QUERY = `
  query StopsNearMe($lat: Float!, $lon: Float!, $radius: Int!) {
    stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
      edges {
        node {
          distance
          stop {
            gtfsId
            code
            name
            lat
            lon
            routes {
              gtfsId
              shortName
              mode
            }
          }
        }
      }
    }
  }
`;

type StopItem = {
  id: string;
  name: string;
  code?: string | null;
  lat: number;
  lon: number;
  distance: number;
  routes: Array<{id: string; shortName?: string | null; mode: string}>;
};

export default function StopsScreen({navigation}: any) {
  const theme = useTheme();

  const [location, setLocation] = useState<{lat: number; lon: number} | null>(
    null,
  );
  const [radius, setRadius] = useState<number>(200);
  const [menuVisible, setMenuVisible] = useState(false);

  const [stops, setStops] = useState<StopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStopId, setSelectedStopId] = useState<string | undefined>();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [height * 0.25, height * 0.5, height * 0.8],
    [],
  );

  // --- utils
  const getCurrentLocation = () =>
    new Promise<{lat: number; lon: number}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
        err => reject(err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });

  const fetchGraphQL = async (query: string, variables: any) => {
    const res = await fetch(OTP_GRAPHQL_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query, variables}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  };

  const loadStops = async (loc: {lat: number; lon: number}, r: number) => {
    setError(null);
    const data = await fetchGraphQL(STOPS_QUERY, {
      lat: loc.lat,
      lon: loc.lon,
      radius: r,
    });
    const edges = data?.stopsByRadius?.edges ?? [];

    const map = new Map<string, StopItem>();
    edges.forEach((e: any) => {
      const st = e?.node?.stop;
      const dist = e?.node?.distance ?? null;
      if (!st || dist == null) return;
      const item: StopItem = {
        id: st.gtfsId,
        name: st.name,
        code: st.code,
        lat: st.lat,
        lon: st.lon,
        distance: dist,
        routes: (st.routes ?? []).map((r: any) => ({
          id: r.gtfsId,
          shortName: r.shortName,
          mode: r.mode,
        })),
      };
      const prev = map.get(st.gtfsId);
      if (!prev || dist < prev.distance) map.set(st.gtfsId, item);
    });

    setStops(Array.from(map.values()).sort((a, b) => a.distance - b.distance));
  };

  // --- effects
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'ios') {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          if (auth !== 'granted') {
            setError('Permesso di localizzazione negato');
            return;
          }
        }
        const pos = await getCurrentLocation();
        setLocation(pos);
      } catch {
        setError('Errore nella geolocalizzazione');
      }
    })();
  }, []);

  useEffect(() => {
    if (!location) return;
    (async () => {
      setLoading(true);
      try {
        await loadStops(location, radius);
      } catch (e: any) {
        setError(e?.message || 'Errore nel caricamento delle fermate');
        setStops([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [location, radius]);

  const onRefresh = async () => {
    if (!location) return;
    setRefreshing(true);
    try {
      await loadStops(location, radius);
    } finally {
      setRefreshing(false);
    }
  };

  const radiusLabel = useMemo(
    () => (radius < 1000 ? `${radius} m` : '1 km'),
    [radius],
  );

  // --- render item
  const renderItem = ({item}: {item: StopItem}) => {
    const distanceStr =
      item.distance < 1000
        ? `${Math.round(item.distance)} m`
        : `${(item.distance / 1000).toFixed(1)} km`;

    return (
      <TouchableRipple
        onPress={() => {
          // seleziona anche su mappa
          setSelectedStopId(item.id);
          // (opzionale) porta su il bottom sheet
          sheetRef.current?.expand?.();
          // naviga al dettaglio
          navigation.navigate('StopDetail', {
            stopId: item.id,
            name: item.name,
            lat: item.lat,
            lon: item.lon,
            code: item.code,
            distance: item.distance,
            routes: item.routes,
          });
        }}
        rippleColor="rgba(0,0,0,0.1)"
        style={styles.stopRow}
        borderless>
        <View style={{flex: 1}}>
          <View style={styles.stopHeader}>
            <Text
              style={[styles.stopName, {color: theme.colors.onSurface}]}
              numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.distance, {color: theme.colors.secondary}]}>
              {distanceStr}
            </Text>
          </View>

          {!!item.code && (
            <Text style={styles.stopCode}>Codice: {item.code}</Text>
          )}

          <View style={styles.routesRow}>
            {item.routes.slice(0, 8).map(r => (
              <Chip key={r.id} compact style={styles.routeChip}>
                {r.shortName || r.mode}
              </Chip>
            ))}
            {item.routes.length > 8 && (
              <Chip compact style={styles.routeChip}>
                +{item.routes.length - 8}
              </Chip>
            )}
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* MAPPA SOTTO */}
      <View style={styles.mapContainer}>
        <MapStopsView
          stops={stops.map(s => ({
            id: s.id,
            name: s.name,
            lat: s.lat,
            lon: s.lon,
          }))}
          userLocation={location ? [location.lon, location.lat] : null}
          showUser
          showRadius
          radius={radius}
          selectedStopId={selectedStopId}
          onSelectStop={s => {
            setSelectedStopId(s.id);
            // sheetRef.current?.snapToIndex?.(1);
          }}
          onOpenSelectedStop={s => {
            // opzionale: espandi il sheet o meno
            // sheetRef.current?.expand?.();
            navigation.navigate('StopDetail', {
              stopId: s.id,
              name: s.name,
              lat: s.lat,
              lon: s.lon,
              // se vuoi, puoi ricalcolare distanza qui o passarla già calcolata
            });
          }}
          lineColor="#1E88E5"
        />
      </View>

      {/* BOTTOM SHEET SOPRA */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}>
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}>
          {/* Top bar con selettore raggio */}
          <View style={styles.topBar}>
            <Text variant="titleLarge" style={styles.title}>
              Fermate vicino a te
            </Text>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.radiusBtn}
                  contentStyle={{height: CONTROL_HEIGHT}}
                  labelStyle={{fontWeight: 'bold'}}>
                  {radiusLabel}
                </Button>
              }>
              {[50, 100, 200, 400, 1000].map(r => (
                <Menu.Item
                  key={r}
                  onPress={() => {
                    setMenuVisible(false);
                    setRadius(r);
                  }}
                  title={r < 1000 ? `${r} m` : '1 km'}
                />
              ))}
            </Menu>
          </View>

          {/* Lista fermate */}
          {loading && stops.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator animating size="large" />
              <Text style={{marginTop: 12}}>Caricamento fermate...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={{color: theme.colors.error, textAlign: 'center'}}>
                {error}
              </Text>
            </View>
          ) : stops.length === 0 ? (
            <View style={styles.center}>
              <Text>Nessuna fermata trovata nel raggio selezionato.</Text>
            </View>
          ) : (
            <FlatList
              data={stops}
              keyExtractor={s => s.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // MAP + SHEET layout
  mapContainer: {flex: 1, zIndex: 0},
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetContent: {padding: 16},

  // Top bar (sheet)
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  title: {fontWeight: 'bold'},
  radiusBtn: {borderRadius: CONTROL_HEIGHT / 2},

  // States
  center: {alignItems: 'center', justifyContent: 'center', padding: 16},

  // List
  listContent: {paddingBottom: 16},
  stopRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  stopName: {fontSize: 16, fontWeight: '700'},
  distance: {fontSize: 13, fontWeight: '600'},
  stopCode: {marginTop: 2, fontSize: 12, color: '#666'},
  routesRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8},
  routeChip: {height: 28},
});
