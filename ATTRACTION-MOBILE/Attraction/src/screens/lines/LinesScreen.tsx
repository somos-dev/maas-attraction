// src/screens/lines/LinesScreen.tsx
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
} from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';

// Define the GraphQL endpoint URL for your OTP server
const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

// GraphQL query to fetch stops within a radius and their associated routes (lines)
// The query uses variables for dynamic latitude, longitude, and radius.
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
            }
          }
        }
      }
    }
  }
`;

// Interface for a transport line, enriched with fields from the OTP API
interface TransportLine {
  id: string; // gtfsId
  ref: string; // shortName
  name?: string; // longName
  operator?: string; // We'll try to guess this
  from?: string;
  to?: string;
  mode: string; // bus, rail, etc.
}

// Interface for the grouped lines, keyed by operator
interface GroupedLines {
  [operator: string]: TransportLine[];
}

// Function to normalize operator names (if needed, otherwise can be removed)
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

  const theme = useTheme();

  /**
   * @description Fetches the current device location.
   * @returns A promise that resolves with the coordinates.
   */
  const getCurrentLocation = () => {
    return new Promise<{lat: number; lon: number}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => {
          resolve({lat: pos.coords.latitude, lon: pos.coords.longitude});
        },
        err => reject(err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  };

  /**
   * @description Fetches data from the OTP GraphQL endpoint.
   * @param query The GraphQL query string.
   * @param variables The JSON object of query variables.
   * @returns A promise that resolves with the fetched data.
   */
  const fetchGraphQL = async (query: string, variables: any): Promise<any> => {
    const body = JSON.stringify({query, variables});
    const headers = {'Content-Type': 'application/json'};
    console.log('Fetching GraphQL with body:', body);

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

  /**
   * @description Fetches transport lines from the OTP API based on user location.
   * This function replaces both the previous `fetchBusLines` and `fetchTrainLines`.
   */
  const fetchAndGroupLines = async (userLocation: {
    lat: number;
    lon: number;
  }) => {
    try {
      setError(null);

      // Execute the GraphQL query with dynamic variables
      const data = await fetchGraphQL(LINES_QUERY, {
        lat: userLocation.lat,
        lon: userLocation.lon,
        radius: 400, // Search radius in meters
      });

      if (!data || !data.stopsByRadius) {
        setLines({});
        return;
      }

      const uniqueLines: Record<string, TransportLine> = {};

      // Iterate through the fetched data to extract and de-duplicate lines
      data.stopsByRadius.edges.forEach((edge: any) => {
        if (edge.node.stop.routes) {
          edge.node.stop.routes.forEach((route: any) => {
            // Use gtfsId as a unique key to prevent duplicates
            if (!uniqueLines[route.gtfsId]) {
              uniqueLines[route.gtfsId] = {
                id: route.gtfsId,
                ref: route.shortName || route.gtfsId,
                name: route.longName,
                // OTP API doesn't provide operator, so we use a placeholder or guess from the name
                operator: 'Sconosciuto',
                mode: route.mode,
              };
            }
          });
        }
      });

      // Group lines by operator and sort them for a clean display
      const grouped: GroupedLines = {};
      Object.values(uniqueLines).forEach(line => {
        const operator = normalizeOperatorName(line.operator || 'Sconosciuto');
        if (!grouped[operator]) grouped[operator] = [];
        grouped[operator].push(line);
      });

      // Sort lines within each operator group
      Object.keys(grouped).forEach(operator => {
        grouped[operator].sort((a, b) => a.ref.localeCompare(b.ref));
      });

      setLines(grouped);
    } catch (err) {
      console.error('Error fetching and grouping lines:', err);
      setError('Errore nel caricamento delle linee. Riprova più tardi.');
      setLines({});
    }
  };

  /**
   * @description Initializes geolocation on component mount.
   */
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

  /**
   * @description Fetches data when the location is available.
   */
  useEffect(() => {
    if (!location) return;
    const loadLines = async () => {
      setLoading(true);
      await fetchAndGroupLines(location);
      setLoading(false);
    };
    loadLines();
  }, [location]);

  /**
   * @description Handles pull-to-refresh action.
   */
  const onRefresh = async () => {
    if (!location) return;
    setRefreshing(true);
    await fetchAndGroupLines(location);
    setRefreshing(false);
  };

  /**
   * @description Renders the list of lines filtered by the selected transport mode.
   */
  const renderLines = () => {
    const linesToDisplay = Object.entries(lines).reduce(
      (acc, [operator, list]) => {
        const filteredList = list.filter(line => {
          if (value === 'bus') return line.mode === 'BUS';
          if (value === 'train')
            return line.mode === 'RAIL' || line.mode === 'SUBWAY';
          return true; // For other tabs, e.g., favorites
        });
        if (filteredList.length > 0) {
          acc[operator] = filteredList;
        }
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
              <View key={line.id} style={styles.lineRow}>
                <Text style={[styles.lineRef, {color: theme.colors.secondary}]}>
                  {line.ref}
                </Text>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>
                    {line.name || `Linea ${line.mode}`}
                  </Text>
                  {line.from && line.to && (
                    <Text style={styles.lineSubtitle}>
                      {line.from} ↔ {line.to}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
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
            },
            labelStyle: {
              color:
                value === 'train'
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
              fontWeight: 'bold',
            },
          },
          {
            value: 'favorites',
            label: 'Preferiti',
            style: {
              backgroundColor:
                value === 'favorites' ? theme.colors.primary : 'transparent',
            },
            labelStyle: {
              color:
                value === 'favorites'
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
              fontWeight: 'bold',
            },
          },
        ]}
        style={styles.segmented}
      />

      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Linee nella tua zona
        </Text>
        {renderLines()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  segmented: {marginBottom: 20},
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
  lineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lineName: {
    fontSize: 15,
    fontWeight: '600',
  },
  lineSubtitle: {
    fontSize: 13,
    color: '#666',
  },
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
