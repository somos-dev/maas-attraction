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
  IconButton,
  Card,
} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/AppStack';

// Stesso endpoint dell’altro screen
const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

// Query dettagli route: nome, operator, mode, patterns con fermate
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

type Props = NativeStackScreenProps<RootStackParamList, 'LineDetail'>;

const parseDirection = (s?: string) => {
  if (!s) return {label: null as string | null, base: s};
  const trimmed = s.trim();
  if (/\sA$/i.test(trimmed))
    return {label: 'Andata', base: trimmed.replace(/\sA$/i, '').trim()};
  if (/\sR$/i.test(trimmed))
    return {label: 'Ritorno', base: trimmed.replace(/\sR$/i, '').trim()};
  return {label: null, base: trimmed};
};

export default function LineDetailScreen({route, navigation}: Props) {
  const {routeId, ref, name, operator, mode} = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // riuso fetchGraphQL inline (puoi estrarlo in utils se preferisci)
  const fetchGraphQL = async (query: string, variables: any) => {
    const body = JSON.stringify({query, variables});
    const headers = {'Content-Type': 'application/json'};
    const res = await fetch(OTP_GRAPHQL_URL, {method: 'POST', headers, body});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  };

  useEffect(() => {
    // Imposta titolo dinamico nello stack (facoltativo)
    navigation.setOptions({
      title: ref ? `Linea ${ref}` : 'Dettagli linea',
    });

    const load = async () => {
      try {
        setErr(null);
        setLoading(true);
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

  const routeObj = data?.route;

  const header = useMemo(() => {
    const short = routeObj?.shortName ?? ref ?? '';
    const long = routeObj?.longName ?? name ?? '';

    const dirFromLong = parseDirection(long);
    const dirFromShort = parseDirection(short);

    const directionLabel =
      // se l’hai passata dai params, usa quella; altrimenti calcola qui
      (route.params as any)?.directionLabel ??
      dirFromLong.label ??
      dirFromShort.label ??
      null;

    const displayName = dirFromLong.base || long; // nome “pulito”
    const displayRef = short;
    const displayOperator = routeObj?.agency?.name ?? operator ?? '';
    const displayMode = routeObj?.mode ?? mode ?? '';

    return {
      displayRef,
      displayName,
      displayOperator,
      displayMode,
      directionLabel,
    };
  }, [data, ref, name, operator, mode, route.params]);

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

  const patterns = routeObj.patterns ?? [];

  const tubeColor = routeObj?.color
    ? `#${routeObj.color}`
    : theme.colors.primary;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header info */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            {header.displayRef ? (
              <Chip compact mode="flat" style={styles.refChip}>
                {header.displayRef}
              </Chip>
            ) : null}
            <Chip compact icon="domain">
              {header.displayOperator || 'Operatore sconosciuto'}
            </Chip>
            {/* <Chip compact icon="bus">
              {header.displayMode}
            </Chip> */}
          </View>
          {header.directionLabel ? (
            <>
              <Text variant="titleLarge" style={styles.title}>
                {header.directionLabel}
              </Text>
              {header.displayName ? (
                <Text style={styles.desc}>{header.displayName}</Text>
              ) : null}
            </>
          ) : header.displayName ? (
            <Text variant="titleLarge" style={styles.title}>
              {header.displayName}
            </Text>
          ) : null}
          {routeObj.desc ? (
            <Text style={styles.desc}>{routeObj.desc}</Text>
          ) : null}
        </Card.Content>
      </Card>

      {/* Patterns */}
      <List.Section style={{paddingLeft: 6, marginLeft: -12}}>
        <List.Subheader>Direzioni e fermate</List.Subheader>
        {patterns.length === 0 ? (
          <Text style={{paddingHorizontal: 16, color: '#666'}}>
            Nessun pattern disponibile per questa linea.
          </Text>
        ) : (
          patterns.map((p: any, idx: number) => (
            <View key={p.id}>
              <List.Accordion
                title={p.name || `Direzione ${p.directionId ?? idx}`}
                left={props => <List.Icon {...props} icon="arrow-right-bold" />}
                style={styles.accordion}>
                {p.stops?.map((s: any, i: number) => {
                  const isRef = s.gtfsId === route.params.referenceStopId;
                  const isFirst = i === 0;
                  const isLast = i === (p.stops?.length ?? 1) - 1;

                  return (
                    <View key={s.gtfsId} style={styles.stopRow}>
                      {/* Colonna timeline */}
                      <View style={styles.timelineCol}>
                        {/* segmento sopra (sovrapposto di 1px per continuità) */}
                        <View
                          style={[
                            styles.segment,
                            !isFirst
                              ? styles.segmentVisible
                              : styles.segmentHidden,
                            !isFirst && {backgroundColor: tubeColor},
                          ]}
                        />

                        {/* pallino */}
                        <View
                          style={[
                            styles.bullet,
                            isRef ? styles.bulletActive : styles.bulletIdle,
                            isRef
                              ? {
                                  borderColor: tubeColor,
                                  backgroundColor: tubeColor,
                                }
                              : {
                                  borderColor: theme.colors.outline,
                                  backgroundColor: theme.colors.surface,
                                },
                          ]}
                        />

                        {/* segmento sotto (sovrapposto di 1px per continuità) */}
                        <View
                          style={[
                            styles.segment,
                            !isLast
                              ? styles.segmentVisible
                              : styles.segmentHidden,
                            !isLast && {backgroundColor: tubeColor},
                          ]}
                        />
                      </View>

                      {/* Testo fermata */}
                      <View style={styles.stopContent}>
                        <View style={styles.stopHeader}>
                          <Text
                            style={[
                              styles.stopName,
                              isRef && {color: tubeColor, fontWeight: '800'},
                            ]}>
                            {s.name}
                          </Text>
                          {isRef && (
                            <Chip compact style={styles.nearChip}>
                              Più vicina
                            </Chip>
                          )}
                        </View>
                        {!!s.code && (
                          <Text style={styles.stopCode}>Codice: {s.code}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </List.Accordion>
              <Divider />
            </View>
          ))
        )}
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  headerCard: {marginBottom: 12},
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  refChip: {alignSelf: 'flex-start'},
  title: {fontWeight: '700', marginTop: 4},
  desc: {marginTop: 6, color: '#666'},
  accordion: {backgroundColor: 'transparent'},
  stopRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 0,
  },

  timelineCol: {
    width: 18, // più stretto = più a sinistra
    alignItems: 'center',
    paddingVertical: 0,
  },

  // Segmento verticale: spesso e continuo
  segment: {
    width: 4,
    flexGrow: 1,
    borderRadius: 2,
  },
  segmentVisible: {
    backgroundColor: '#000', // verrà override nel JSX se usi tubeColor
    marginTop: -1, // sovrapposizione per evitare micro-gaps
    marginBottom: -1,
  },
  segmentHidden: {
    backgroundColor: 'transparent',
  },

  // Pallino ingrandito
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    marginVertical: 0,
  },
  bulletActive: {
    borderColor: '#000', // override nel JSX con tubeColor
    backgroundColor: '#000',
  },
  bulletIdle: {
    borderColor: '#999',
    backgroundColor: '#fff',
  },

  // Contenuto: meno margine sinistro
  stopContent: {
    flex: 1,
    marginLeft: 6, // 👈 meno margine: pallini più a sinistra
    paddingVertical: 10, // lo spacing verticale sta qui, non sulla riga
  },

  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  stopNameActive: {
    color: '#000', // override nel JSX con tubeColor
    fontWeight: '800',
  },
  nearChip: {alignSelf: 'flex-start'},
  stopCode: {marginTop: 2, fontSize: 12, color: '#666'},
});
