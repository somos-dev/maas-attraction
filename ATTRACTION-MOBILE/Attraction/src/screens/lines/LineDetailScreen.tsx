// src/screens/lines/LineDetailScreen.tsx
import React, {useEffect, useState, useMemo} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  ActivityIndicator,
  useTheme,
  Chip,
  List,
  Divider,
  Card,
} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/AppStack';

const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

// 🔹 Query dettagli route
const ROUTE_DETAILS_QUERY = `
  query RouteDetails($routeId: String!) {
    route(id: $routeId) {
      gtfsId
      shortName
      longName
      desc
      mode
      color
      textColor
      agency { id name }
      patterns {
        id
        name
        directionId
        stops {
          gtfsId
          code
          name
          lat
          lon
        }
      }
    }
  }
`;

// 🔹 Query orari fermata
const STOP_TIMES_QUERY = `
  query StopTimes($stopId: String!) {
    stop(id: $stopId) {
      gtfsId
      name
      stoptimesForPatterns(numberOfDepartures: 8) {
        pattern { route { shortName } }
        stoptimes {
          scheduledDeparture
          realtimeDeparture
          realtime
          serviceDay
        }
      }
    }
  }
`;

type Props = NativeStackScreenProps<RootStackParamList, 'LineDetail'>;

export default function LineDetailScreen({route, navigation}: Props) {
  const {
    routeId,
    ref,
    name,
    operator,
    mode,
    referenceStopId,
    referenceStopName,
  } = route.params;
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [nextDepartures, setNextDepartures] = useState<any[]>([]);

  // Funzione generica GraphQL
  const fetchGraphQL = async (query: string, variables: any) => {
    const res = await fetch(OTP_GRAPHQL_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query, variables}),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  };

  // 🔹 Carica dettagli linea
  useEffect(() => {
    navigation.setOptions({
      title: ref ? `Linea ${ref}` : 'Dettagli linea',
    });

    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await fetchGraphQL(ROUTE_DETAILS_QUERY, {routeId});
        setData(d);
      } catch (e: any) {
        setErr(e?.message || 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeId]);

  // 🔹 Carica orari della fermata corrente
  const fetchNextDepartures = async (stopId: string, ref: string) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const d = await fetchGraphQL(STOP_TIMES_QUERY, {stopId});
      const all = d.stop?.stoptimesForPatterns ?? [];

      const match = all.find((p: any) =>
        p.pattern?.route?.shortName
          ?.trim()
          ?.toUpperCase()
          ?.includes(ref?.toUpperCase()),
      );

      if (!match) return [];
      const times = match.stoptimes || [];
      // Filtra solo partenze future
      // 1️⃣ Filtra solo partenze future
      const future = times.filter(
        (t: any) => t.serviceDay + t.scheduledDeparture > now,
      );

      // 2️⃣ Ordina per timestamp reale (serviceDay + departure)
      future.sort(
        (a: any, b: any) =>
          a.serviceDay +
          a.scheduledDeparture -
          (b.serviceDay + b.scheduledDeparture),
      );

      // 3️⃣ Ritorna le prime 4, ordinate (oggi prima, domani dopo)
      return future.slice(0, 4);
    } catch (err) {
      console.error('Errore fetch orari:', err);
      return [];
    }
  };

  useEffect(() => {
    if (!referenceStopId || !ref) return;

    const loadTimes = async () => {
      const t = await fetchNextDepartures(referenceStopId, ref);
      setNextDepartures(t);
    };

    loadTimes();
    const interval = setInterval(loadTimes, 60000); // refresh ogni 60 s
    return () => clearInterval(interval);
  }, [referenceStopId, ref]);

  const routeObj = data?.route;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{marginTop: 12}}>Caricamento dettagli...</Text>
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

  if (!routeObj) {
    return (
      <View style={styles.center}>
        <Text>Nessun dettaglio trovato per questa linea.</Text>
      </View>
    );
  }

  const tubeColor = routeObj?.color
    ? `#${routeObj.color}`
    : theme.colors.primary;
  const patterns = routeObj.patterns ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            {routeObj.shortName && (
              <Chip
                compact
                style={[styles.refChip, {backgroundColor: tubeColor}]}>
                <Text style={{color: '#fff', fontWeight: '700'}}>
                  {routeObj.shortName}
                </Text>
              </Chip>
            )}
            {routeObj.agency?.name && (
              <Chip compact icon="domain">
                {routeObj.agency.name}
              </Chip>
            )}
          </View>
          <Text variant="titleLarge" style={styles.title}>
            {routeObj.longName || name || 'Percorso'}
          </Text>
          {routeObj.desc && <Text style={styles.desc}>{routeObj.desc}</Text>}

          {/* 🔹 Prossime partenze */}
          {referenceStopId && nextDepartures.length > 0 && (
            <View style={{marginTop: 12}}>
              <Text style={styles.nextHeader}>
                Prossime partenze da {referenceStopName}:
              </Text>
              {nextDepartures.map((t, i) => {
                const dep =
                  (t.realtimeDeparture || t.scheduledDeparture) +
                  (t.serviceDay || 0);

                const depDate = new Date(dep * 1000);
                const timeStr = depDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                // 🔸 Calcolo se è "domani" rispetto ad oggi
                const now = new Date();
                const isTomorrow =
                  depDate.getDate() !== now.getDate() ||
                  depDate.getMonth() !== now.getMonth();

                return (
                  <Text key={i} style={styles.nextTime}>
                    🕒 {timeStr}
                    {isTomorrow ? ' (Domani)' : ''}{' '}
                    {t.realtime ? '(tempo reale)' : ''}
                  </Text>
                );
              })}
            </View>
          )}

          {referenceStopId && nextDepartures.length === 0 && (
            <Text style={[styles.nextTime, {marginTop: 8}]}>
              Nessuna partenza imminente da {referenceStopName}.
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Fermate */}
      <List.Section>
        <List.Subheader>Fermate lungo la linea</List.Subheader>
        {patterns.length === 0 ? (
          <Text style={{paddingHorizontal: 16, color: '#666'}}>
            Nessuna fermata disponibile.
          </Text>
        ) : (
          patterns[0].stops.map((s: any, i: number) => {
            const isRef = s.gtfsId === referenceStopId;
            const isFirst = i === 0;
            const isLast = i === patterns[0].stops.length - 1;

            return (
              <View key={s.gtfsId} style={styles.stopRow}>
                <View style={styles.timelineCol}>
                  <View
                    style={[
                      styles.segment,
                      !isFirst && {backgroundColor: tubeColor},
                    ]}
                  />
                  <View
                    style={[
                      styles.bullet,
                      isRef
                        ? {backgroundColor: tubeColor, borderColor: tubeColor}
                        : {borderColor: '#999'},
                    ]}
                  />
                  <View
                    style={[
                      styles.segment,
                      !isLast && {backgroundColor: tubeColor},
                    ]}
                  />
                </View>

                <View style={styles.stopContent}>
                  <View style={styles.stopHeader}>
                    <Text
                      style={[
                        styles.stopName,
                        isRef && {color: tubeColor, fontWeight: '800'},
                      ]}>
                      {s.name}
                    </Text>
                    {isRef && <Chip compact>Più vicina</Chip>}
                  </View>
                  {!!s.code && (
                    <Text style={styles.stopCode}>Codice: {s.code}</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16},
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerCard: {marginBottom: 16},
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  refChip: {alignSelf: 'flex-start'},
  title: {fontWeight: '700', marginTop: 4},
  desc: {marginTop: 4, color: '#666'},
  nextHeader: {fontWeight: '700', marginBottom: 4},
  nextTime: {fontSize: 14, color: '#444'},
  stopRow: {flexDirection: 'row', alignItems: 'stretch'},
  timelineCol: {width: 20, alignItems: 'center'},
  segment: {width: 3, flexGrow: 1, borderRadius: 2},
  bullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  stopContent: {flex: 1, marginLeft: 8, paddingVertical: 8},
  stopHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  stopName: {fontSize: 15, fontWeight: '600'},
  stopCode: {fontSize: 12, color: '#666', marginTop: 2},
});
