// src/screens/services/StopDetailScreen.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, ScrollView, Platform, Linking} from 'react-native';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Divider,
  List,
  Button,
} from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
// import type { RootStackParamList } from '../../navigation/AppStack'; // <-- assicurati di avere StopDetail e LineDetail

import MapStopsView from '../../components/maps/MapStopsView';

// ---------- GraphQL ----------
const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

/**
 * Dettagli fermata + rotte + partenze prossime (realtime se disponibile).
 * - `stoptimesForPatterns` è la via più moderna su OTP2. Se la tua istanza non lo espone,
 *   puoi ripiegare su `stoptimesForStop`.
 */
const STOP_DETAILS_QUERY = `
  query StopDetails($id: String!, $startTime: Long!, $timeRange: Int!, $numberOfDepartures: Int!) {
    stop(id: $id) {
      gtfsId
      name
      code
      desc
      lat
      lon
      zoneId
      routes {
        gtfsId
        shortName
        longName
        mode
        color
        textColor
        agency { id name }
      }
      stoptimesForPatterns(startTime: $startTime, timeRange: $timeRange, numberOfDepartures: $numberOfDepartures) {
        pattern {
          id
          name
          directionId
          route {
            gtfsId
            shortName
            longName
            mode
            color
            textColor
            agency { id name }
          }
        }
        stoptimes {
          scheduledDeparture
          realtimeDeparture
          realtimeState
          serviceDay
          headsign
          pickupType
          dropoffType
        }
      }
    }
  }
`;

// ---------- tipi ----------
type Props = NativeStackScreenProps<any, 'StopDetail'>;

type PatternGroup = {
  id: string;
  label: string;
  nameBase?: string | null;
  routeId?: string | null; // 👈 aggiungi questo
  routeShort?: string | null;
  routeMode?: string | null;
  trips: Array<{
    departureEpoch: number;
    isRealtime: boolean;
    headsign?: string | null;
  }>;
};

// ---------- util ----------
const toRad = (d: number) => (d * Math.PI) / 180;
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const formatDistance = (m?: number | null) =>
  !m && m !== 0
    ? '-'
    : m < 1000
    ? `${Math.round(m)} m`
    : `${(m / 1000).toFixed(1)} km`;

const parseDirection = (s?: string | null) => {
  if (!s) return {label: null as string | null, base: s};
  const trimmed = s.trim();
  if (/\sA$/i.test(trimmed))
    return {label: 'Andata', base: trimmed.replace(/\sA$/i, '').trim()};
  if (/\sR$/i.test(trimmed))
    return {label: 'Ritorno', base: trimmed.replace(/\sR$/i, '').trim()};
  return {label: null, base: trimmed};
};

const fmtTime = (epochSeconds: number) => {
  const d = new Date(epochSeconds * 1000);
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function StopDetailScreen({route, navigation}: Props) {
  // parametri passati dallo StopsScreen
  const {
    stopId,
    name: nameParam,
    code: codeParam,
    lat: latParam,
    lon: lonParam,
    distance: distParam,
    routes: routesParam,
  } = (route.params || {}) as {
    stopId: string;
    name?: string;
    code?: string | null;
    lat?: number;
    lon?: number;
    distance?: number;
    routes?: Array<{id: string; shortName?: string | null; mode: string}>;
  };

  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<{lat: number; lon: number} | null>(
    null,
  );

  // header
  useEffect(() => {
    navigation.setOptions({
      title: nameParam ? nameParam : 'Dettaglio fermata',
    });
  }, [nameParam]);

  // posizione utente (per distanza e mappa)
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'ios') {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          if (auth !== 'granted') {
            return; // non bloccare la schermata se l'utente nega
          }
        }
        Geolocation.getCurrentPosition(
          pos =>
            setUserLoc({lat: pos.coords.latitude, lon: pos.coords.longitude}),
          () => {},
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 10000},
        );
      } catch {}
    })();
  }, []);

  // fetch dettagli fermata
  useEffect(() => {
    const load = async () => {
      try {
        setErr(null);
        setLoading(true);
        const now = Math.floor(Date.now() / 1000);

        const res = await fetch(OTP_GRAPHQL_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            query: STOP_DETAILS_QUERY,
            variables: {
              id: stopId,
              startTime: now,
              timeRange: 7200,
              numberOfDepartures: 10,
            }, // 2 ore, 10 passaggi
          }),
          // @ts-ignore
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        setData(json.data);
      } catch (e: any) {
        setErr(e?.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stopId]);

  const stopObj = data?.stop;

  // header info consolidate
  const header = useMemo(() => {
    const n = stopObj?.name ?? nameParam ?? '';
    const c = stopObj?.code ?? codeParam ?? null;
    const lat = stopObj?.lat ?? latParam ?? null;
    const lon = stopObj?.lon ?? lonParam ?? null;

    let dist: number | null = distParam ?? null;
    if (dist == null && userLoc && lat != null && lon != null) {
      dist = haversine(userLoc.lat, userLoc.lon, lat, lon);
    }
    return {n, c, lat, lon, dist};
  }, [stopObj, nameParam, codeParam, latParam, lonParam, distParam, userLoc]);

  // linee della fermata
  const routes = useMemo(() => {
    const r1 = stopObj?.routes ?? [];
    if (r1.length > 0) return r1;
    // fallback: dai params (da lista)
    return routesParam ?? [];
  }, [stopObj, routesParam]);

  // prossime partenze raggruppate per pattern/direzione
  const patternGroups: PatternGroup[] = useMemo(() => {
    const raw = stopObj?.stoptimesForPatterns ?? [];
    const groups: PatternGroup[] = raw.map((p: any) => {
      const dirParsed = parseDirection(p?.pattern?.name);
      const label =
        dirParsed.label ??
        (typeof p?.pattern?.directionId === 'number'
          ? p.pattern.directionId === 0
            ? 'Andata'
            : 'Ritorno'
          : p?.pattern?.name ?? 'Direzione');

      const trips = (p?.stoptimes ?? []).map((st: any) => {
        const dep =
          (st.realtimeDeparture || st.scheduledDeparture || 0) +
          (st.serviceDay || 0);
        return {
          departureEpoch: dep,
          isRealtime: st.realtimeState && st.realtimeState !== 'SCHEDULED',
          headsign: st.headsign ?? null,
        };
      });

      return {
        id: p?.pattern?.id ?? Math.random().toString(36),
        routeId: p?.pattern?.route?.gtfsId ?? null, // 👈 aggiungi qui
        label,
        nameBase: dirParsed.base ?? p?.pattern?.name ?? null,
        routeShort: p?.pattern?.route?.shortName ?? null,
        routeMode: p?.pattern?.route?.mode ?? null,
        trips: trips.sort(
          (a: any, b: any) => a.departureEpoch - b.departureEpoch,
        ),
      };
    });

    // ordina gruppi mettendo Andata prima di Ritorno
    return groups.sort((a, b) => {
      const prio = (x: string) =>
        x === 'Andata' ? 0 : x === 'Ritorno' ? 1 : 2;
      return prio(a.label) - prio(b.label);
    });
  }, [stopObj]);

  // azioni
  const openInMaps = () => {
    if (!header.lat || !header.lon) return;
    const url = Platform.select({
      ios: `maps://?q=${encodeURIComponent(header.n)}&ll=${header.lat},${
        header.lon
      }`,
      android: `geo:${header.lat},${header.lon}?q=${encodeURIComponent(
        header.n,
      )}`,
    });
    if (url) Linking.openURL(url);
  };

  const goToLineDetail = (
    routeId: string,
    shortName?: string | null,
    longName?: string | null,
    operator?: string | null,
    mode?: string | null,
  ) => {
    navigation.navigate('LineDetailStop', {
      routeId,
      ref: shortName ?? routeId,
      name: longName ?? undefined,
      operator: operator ?? undefined,
      mode: mode ?? undefined,
      // puoi passare anche referenceStopId/name = questa fermata:
      referenceStopId: stopObj?.gtfsId ?? stopId,
      referenceStopName: stopObj?.name ?? header.n,
    });
  };

  // UI -------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{marginTop: 12}}>Caricamento fermata...</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={{color: theme.colors.error, textAlign: 'center'}}>
          {err}
        </Text>
      </View>
    );
  }

  if (!stopObj && !nameParam) {
    return (
      <View style={styles.center}>
        <Text>Fermata non trovata.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Mini mappa */}
      {header.lat != null && header.lon != null && (
        <View style={styles.mapCard}>
          <View style={{height: 180, borderRadius: 12, overflow: 'hidden'}}>
            <MapStopsView
              stops={[
                {
                  id: stopId,
                  name: header.n,
                  lat: header.lat!,
                  lon: header.lon!,
                },
              ]}
              userLocation={userLoc ? [userLoc.lon, userLoc.lat] : null}
              showUser
              showRadius
              radius={
                header.dist
                  ? Math.min(Math.max(Math.round(header.dist), 100), 400)
                  : 200
              }
              selectedStopId={stopId}
              onSelectStop={() => {}}
              lineColor={theme.colors.primary}
            />
          </View>
        </View>
      )}

      {/* Header info */}
      <Card style={styles.headerCard}>
        <Card.Content style={{gap: 8}}>
          <View style={styles.headerRow}>
            <Text variant="titleLarge" style={styles.title}>
              {header.n}
            </Text>
            <IconButton
              icon="map"
              onPress={openInMaps}
              accessibilityLabel="Apri in Mappe"
            />
          </View>

          <View style={styles.metaRow}>
            {header.c ? (
              <Chip compact icon="pound">
                Codice: {header.c}
              </Chip>
            ) : null}
            {header.dist != null ? (
              <Chip compact icon="map-marker-distance">
                {formatDistance(header.dist)}
              </Chip>
            ) : null}
            {stopObj?.zoneId ? (
              <Chip compact icon="ticket-confirmation">
                Zona {stopObj.zoneId}
              </Chip>
            ) : null}
          </View>

          {stopObj?.desc ? (
            <Text style={styles.desc}>{stopObj.desc}</Text>
          ) : null}
        </Card.Content>
      </Card>

      {/* Linee che servono la fermata */}
      <Card style={styles.routesCard}>
        <Card.Title title="Linee alla fermata" />
        <Card.Content>
          {routes.length === 0 ? (
            <Text style={{color: '#666'}}>Nessuna linea associata.</Text>
          ) : (
            <View style={styles.routesWrap}>
              {routes.map((r: any) => (
                <Chip
                  key={r.gtfsId || r.id}
                  compact
                  style={styles.routeChip}
                  onPress={() =>
                    goToLineDetail(
                      r.gtfsId || r.id,
                      r.shortName,
                      r.longName,
                      r.agency?.name ?? null,
                      r.mode,
                    )
                  }>
                  {r.shortName || r.longName || r.mode}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Prossime partenze */}
      <Card style={styles.departuresCard}>
        <Card.Title title="Prossime partenze" />
        <Card.Content>
          {patternGroups.length === 0 ? (
            <Text style={{color: '#666'}}>
              Nessuna partenza nelle prossime 2 ore.
            </Text>
          ) : (
            patternGroups.map((g, idx) => (
              <View key={g.id}>
                <List.Section>
                  <List.Subheader>
                    {g.label}
                    {g.nameBase ? ` — ${g.nameBase}` : ''}
                    {g.routeShort ? `  (${g.routeShort})` : ''}
                  </List.Subheader>
                  {g.trips.slice(0, 6).map((t, i) => (
                    <List.Item
                      key={`${g.id}-${i}`}
                      title={fmtTime(t.departureEpoch)}
                      description={t.headsign || undefined}
                      left={props => (
                        <List.Icon
                          {...props}
                          icon={t.isRealtime ? 'clock-alert' : 'clock-outline'}
                          color={
                            t.isRealtime ? theme.colors.primary : undefined
                          }
                        />
                      )}
                      right={() => (
                        <Button
                          compact
                          mode="text"
                          onPress={() => {
                            if (g.routeId) {
                              goToLineDetail(
                                g.routeId, // 👈 usa la route corretta
                                g.routeShort ?? g.nameBase,
                                g.nameBase,
                                null,
                                g.routeMode ?? 'bus',
                              );
                            }
                          }}>
                          Dettagli
                        </Button>
                      )}
                    />
                  ))}
                </List.Section>
                {idx < patternGroups.length - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, gap: 12},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mapCard: {borderRadius: 12, overflow: 'hidden'},
  headerCard: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {fontWeight: '700'},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  desc: {color: '#666'},
  routesCard: {},
  routesWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  routeChip: {height: 28},
  departuresCard: {},
});
