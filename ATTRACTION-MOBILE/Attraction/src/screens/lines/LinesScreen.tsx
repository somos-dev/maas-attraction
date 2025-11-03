import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  Text,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
  Menu,
  Button,
  TouchableRipple,
} from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

const CONTROL_HEIGHT = 40;

// 🔹 GraphQL endpoint OTP
const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

// 🔹 Query estesa: include patterns e stops per ottenere prima/ultima fermata
const LINES_QUERY = `
  query LinesNearMe($lat: Float!, $lon: Float!, $radius: Int!) {
    stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
      edges {
        node {
          stop {
            gtfsId
            name
            routes {
              gtfsId
              shortName
              longName
              desc
              mode
              agency { id name }
              patterns {
                id
                name
                stops { name }
              }
            }
          }
        }
      }
    }
  }
`;

// Tipi
interface TransportLine {
  id: string;
  ref: string;
  name?: string;
  operator?: string;
  from?: string;
  to?: string;
  mode: string;
  refStopId?: string;
  refStopName?: string;
}

interface GroupedLines {
  [operator: string]: TransportLine[];
}

const normalizeOperatorName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('amaco')) return 'AMACO';
  if (lower.includes('ferrovie della calabria'))
    return 'Ferrovie della Calabria';
  if (lower.includes('flixbus')) return 'FlixBus';
  if (lower.includes('trenitalia')) return 'Trenitalia';
  return name.trim();
};

export default function LinesScreen() {
  const [value, setValue] = useState('bus');
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(
    null,
  );
  const [lines, setLines] = useState<GroupedLines>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(200);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  // 🔹 Ottiene la posizione utente
  const getCurrentLocation = () => {
    return new Promise<{lat: number; lon: number}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
        err => reject(err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  };

  // 🔹 Esegue query GraphQL generica
  const fetchGraphQL = async (query: string, variables: any): Promise<any> => {
    const body = JSON.stringify({query, variables});
    const headers = {'Content-Type': 'application/json'};
    try {
      const res = await fetch(OTP_GRAPHQL_URL, {method: 'POST', headers, body});
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      return json.data;
    } catch (err) {
      console.error('Error fetching GraphQL data:', err);
      throw err;
    }
  };

  // 🔹 Carica e raggruppa le linee (bus/treni)
  const fetchAndGroupLines = async (
    userLocation: {lat: number; lon: number},
    r: number,
  ) => {
    try {
      setError(null);

      const data = await fetchGraphQL(LINES_QUERY, {
        lat: userLocation.lat,
        lon: userLocation.lon,
        radius: r,
      });

      if (!data || !data.stopsByRadius) {
        setLines({});
        return;
      }

      const dedup = new Map<string, TransportLine & {ids: string[]}>();

      data.stopsByRadius.edges.forEach((edge: any) => {
        if (!edge.node.stop?.routes) return;

        const stopId = edge.node.stop.gtfsId;
        const stopName = edge.node.stop.name;

        edge.node.stop.routes.forEach((route: any) => {
          const operatorName = route.agency?.name
            ? normalizeOperatorName(route.agency.name)
            : 'Sconosciuto';

          // Prima/ultima fermata dal primo pattern disponibile
          let from: string | null = null;
          let to: string | null = null;
          const patterns = route.patterns || [];
          if (patterns.length > 0 && patterns[0].stops?.length >= 2) {
            from = patterns[0].stops[0].name;
            to = patterns[0].stops[patterns[0].stops.length - 1].name;
          }

          const ref = (
            route.shortName ||
            route.longName ||
            route.gtfsId ||
            ''
          ).trim();
          const refNorm = ref.replace(/\s+/g, ' ').toUpperCase();
          const key = `${operatorName}|${route.mode}|${refNorm}`;

          if (!dedup.has(key)) {
            dedup.set(key, {
              id: route.gtfsId,
              ref,
              name: route.longName,
              operator: operatorName,
              mode: route.mode,
              from: from || undefined,
              to: to || undefined,
              ids: [route.gtfsId],
              refStopId: stopId,
              refStopName: stopName,
            });
          } else {
            const cur = dedup.get(key)!;
            cur.ids.push(route.gtfsId);
            if (!cur.name && route.longName) cur.name = route.longName;
            if (!cur.from && from) cur.from = from;
            if (!cur.to && to) cur.to = to;
          }
        });
      });

      // 🔹 Raggruppa per operatore
      const grouped: GroupedLines = {};
      Array.from(dedup.values()).forEach(line => {
        const operator = line.operator || 'Sconosciuto';
        if (!grouped[operator]) grouped[operator] = [];
        grouped[operator].push(line);
      });

      // 🔹 Ordina per nome linea
      Object.keys(grouped).forEach(operator => {
        grouped[operator].sort((a, b) =>
          (a.ref || '').localeCompare(b.ref || '', undefined, {
            numeric: true,
            sensitivity: 'base',
          }),
        );
      });

      setLines(grouped);
    } catch (err) {
      console.error('Error fetching and grouping lines:', err);
      setError('Errore nel caricamento delle linee. Riprova più tardi.');
      setLines({});
    }
  };

  // 🔹 Inizializza la geolocalizzazione
  useEffect(() => {
    const initLocation = async () => {
      try {
        if (Platform.OS === 'ios') {
          const authStatus = await Geolocation.requestAuthorization(
            'whenInUse',
          );
          if (authStatus !== 'granted') {
            setError('Permesso di localizzazione negato');
            return;
          }
        }
        const pos = await getCurrentLocation();
        setLocation(pos);
      } catch (err) {
        console.error('Geolocation error:', err);
        setError('Errore nella geolocalizzazione');
      }
    };
    initLocation();
  }, []);

  // 🔹 Carica linee appena disponibile la posizione
  useEffect(() => {
    if (!location) return;
    const loadLines = async () => {
      setLoading(true);
      await fetchAndGroupLines(location, radius);
      setLoading(false);
    };
    loadLines();
  }, [location, radius]);

  // 🔹 Refresh manuale
  const onRefresh = async () => {
    if (!location) return;
    setRefreshing(true);
    await fetchAndGroupLines(location, radius);
    setRefreshing(false);
  };

  // 🔹 Rendering lista linee
  const renderLines = () => {
    const linesToDisplay = Object.entries(lines).reduce(
      (acc, [operator, list]) => {
        const filteredList = list.filter(line => {
          if (value === 'bus') return line.mode === 'BUS';
          if (value === 'train')
            return line.mode === 'RAIL' || line.mode === 'SUBWAY';
          return true;
        });
        if (filteredList.length > 0) acc[operator] = filteredList;
        return acc;
      },
      {} as GroupedLines,
    );

    if (loading && Object.keys(linesToDisplay).length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating size="large" />
          <Text style={styles.loadingText}>Caricamento linee...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (Object.keys(linesToDisplay).length === 0 && !loading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Nessuna linea trovata nella tua zona
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={Object.keys(linesToDisplay)}
        keyExtractor={item => item}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item: operator}) => (
          <View style={styles.operatorBlock}>
            <Text style={[styles.operatorTitle, {color: theme.colors.primary}]}>
              {operator}
            </Text>
            {linesToDisplay[operator].map(line => (
              <TouchableRipple
                key={line.id}
                onPress={() =>
                  navigation.navigate('LineDetail', {
                    routeId: line.id,
                    ref: line.ref,
                    name: line.name,
                    operator: line.operator,
                    mode: line.mode,
                    referenceStopId: line.refStopId,
                    referenceStopName: line.refStopName,
                    from: line.from,
                    to: line.to,
                  })
                }
                rippleColor="rgba(0,0,0,0.1)"
                style={styles.lineRow}
                borderless>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                  <Text
                    style={[styles.lineRef, {color: theme.colors.secondary}]}>
                    {line.ref}
                  </Text>
                  <View style={styles.lineInfo}>
                    <Text style={styles.lineName}>
                      {line.name || `Linea ${line.ref}`}
                    </Text>

                    {line.from && line.to ? (
                      <Text style={styles.lineSubtitle}>
                        {line.from} → {line.to}
                      </Text>
                    ) : line.refStopName ? (
                      <Text style={styles.lineSubtitle}>
                        Fermata: {line.refStopName}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableRipple>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // 🔹 UI principale
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.segmentedWrap}>
          <SegmentedButtons
            value={value}
            onValueChange={setValue}
            buttons={[
              {
                value: 'bus',
                label: 'Bus',
                style: {
                  backgroundColor:
                    value === 'bus' ? theme.colors.primary : 'transparent',
                  height: CONTROL_HEIGHT,
                },
                labelStyle: {
                  color:
                    value === 'bus'
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                  fontWeight: 'bold',
                },
              },
              {
                value: 'train',
                label: 'Treni',
                style: {
                  backgroundColor:
                    value === 'train' ? theme.colors.primary : 'transparent',
                  height: CONTROL_HEIGHT,
                },
                labelStyle: {
                  color:
                    value === 'train'
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                  fontWeight: 'bold',
                },
              },
            ]}
          />
        </View>

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
              {radius < 1000 ? `${radius} m` : '1 km'}
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

      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Linee entro {radius < 1000 ? `${radius} m` : '1 km'}
        </Text>
        {renderLines()}
      </View>
    </View>
  );
}

// 🔹 STILI
const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  segmentedWrap: {
    flex: 1,
    height: CONTROL_HEIGHT,
    justifyContent: 'center',
  },
  radiusBtn: {
    borderRadius: CONTROL_HEIGHT / 2,
  },
  content: {flex: 1},
  title: {marginBottom: 10, fontWeight: 'bold'},
  operatorBlock: {marginBottom: 20},
  operatorTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 18,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  lineRef: {
    fontWeight: 'bold',
    fontSize: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  lineInfo: {flex: 1, marginLeft: 12},
  lineName: {fontSize: 15, fontWeight: '600'},
  lineSubtitle: {fontSize: 13, color: '#666'},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {marginTop: 16, textAlign: 'center'},
  errorText: {textAlign: 'center', fontSize: 16},
  emptyText: {textAlign: 'center', fontSize: 16},
  listContainer: {paddingBottom: 20},
});
