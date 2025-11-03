import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Divider, Chip, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RouteDetailsProps {
  route: any; // dati del percorso normalizzati da plan-trip
  busInfo?: any; // prop opzionale con info da OTP
}

export default function RouteDetails({route, busInfo}: RouteDetailsProps) {
  const theme = useTheme();

  const segments = route?.legs?.length ? route.legs : route?.segments || [];

  if (!segments.length) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {backgroundColor: theme.colors.surface},
        ]}>
        <Text style={[styles.emptyText, {color: theme.colors.onSurface}]}>
          Nessuna istruzione disponibile.
        </Text>
      </View>
    );
  }

  const MODE_CONFIG: Record<
    string,
    {icon: string; color: string; label: string}
  > = {
    walk: {icon: 'walk', color: '#9E9E9E', label: 'A piedi'},
    bus: {icon: 'bus', color: theme.colors.primary, label: 'Bus'},
    train: {icon: 'train', color: '#FFB300', label: 'Treno'},
    tram: {icon: 'tram', color: '#4CAF50', label: 'Tram'},
    subway: {icon: 'subway-variant', color: '#E91E63', label: 'Metro'},
    car: {icon: 'car', color: '#616161', label: 'Auto'},
    bike: {icon: 'scooter', color: '#8BC34A', label: 'Monopattino'},
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.surface}]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      <Text style={[styles.header, {color: theme.colors.onSurface}]}>
        Dettagli del viaggio
      </Text>
      <Divider style={[styles.divider]} />

      {segments.map((seg: any, i: number) => {
        const mode = (seg.type || seg.mode || 'walk').toLowerCase();
        const config = MODE_CONFIG[mode] || MODE_CONFIG.walk;

        const durationMinutes = seg.duration
          ? Math.round(Number(seg.duration) / 60)
          : seg.duration_s
          ? Math.round(Number(seg.duration_s) / 60)
          : null;

        const distanceKm =
          seg.distance_m != null
            ? (Number(seg.distance_m) / 1000).toFixed(2)
            : null;

        const walkSteps =
          Array.isArray(seg.walk_steps) && seg.walk_steps.length > 0
            ? seg.walk_steps
            : [];

        return (
          <View
            key={i}
            style={[
              styles.segmentCard,
              {
                backgroundColor: theme.colors.backgroundCard,
                borderColor: 'transparent',
                shadowColor: theme.dark ? 'transparent' : '#000',
              },
            ]}>
            {/* Header tratta */}
            <View style={styles.segmentHeader}>
              <View
                style={[styles.iconWrapper, {backgroundColor: config.color}]}>
                <Icon name={config.icon} size={18} color="#fff" />
              </View>
              <View style={{flex: 1}}>
                <Text
                  style={[styles.modeTitle, {color: theme.colors.onSurface}]}>
                  {config.label}
                </Text>

                {seg.start_time && seg.end_time ? (
                  <Text
                    style={[styles.timeInfo, {color: theme.colors.onSurface}]}>
                    🕒{' '}
                    {new Date(seg.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    →{' '}
                    {new Date(seg.end_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                ) : durationMinutes ? (
                  <Text
                    style={[styles.timeInfo, {color: theme.colors.onSurface}]}>
                    ⏱ {durationMinutes} min
                  </Text>
                ) : null}

                {/* ✅ nuova riga: distanza per tratta */}
                {distanceKm && (
                  <Text
                    style={[
                      styles.distanceInfo,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    Distanza: {distanceKm} km
                  </Text>
                )}
              </View>
            </View>

            {/* Linea bus/treno */}
            {mode === 'bus' && (
              <View style={styles.chipContainer}>
                {busInfo ? (
                  <Chip
                    icon="bus"
                    style={[
                      styles.routeChip,
                      {
                        borderColor: config.color,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    textStyle={{
                      color: config.color,
                      fontWeight: '600',
                    }}>
                    {busInfo.agency?.name
                      ? `${busInfo.agency.name} ${busInfo.shortName || ''}`
                      : `Linea ${busInfo.shortName || seg.route_short || '?'}`}
                  </Chip>
                ) : (
                  <Chip
                    icon="bus"
                    style={[
                      styles.routeChip,
                      {
                        borderColor: config.color,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    textStyle={{
                      color: config.color,
                      fontWeight: '600',
                    }}>
                    {seg.bus_name || seg.route_short || 'Bus'}{' '}
                    {seg.authority_name || ''}
                  </Chip>
                )}
              </View>
            )}

            {/* Fermate principali */}
            {busInfo?.patterns?.length > 0 && mode === 'bus' && (
              <View style={{marginTop: 12}}>
                <Text
                  style={[styles.stopHeader, {color: theme.colors.onSurface}]}>
                  Fermate principali:
                </Text>
                {busInfo.patterns[0].stops
                  .slice(0, 5)
                  .map((stop: any, j: number) => (
                    <Text
                      key={j}
                      style={[
                        styles.stopItem,
                        {color: theme.colors.onSurface},
                      ]}>
                      • {stop.name}
                    </Text>
                  ))}
              </View>
            )}

            {/* Passi camminata */}
            {walkSteps.length > 0 && (
              <View style={styles.stepsContainer}>
                <Divider style={[styles.stepsDivider]} />
                {walkSteps.map((step: any, j: number) => (
                  <View key={j} style={styles.stepRow}>
                    <Icon
                      name="arrow-right"
                      size={14}
                      color={theme.colors.onSurface}
                    />
                    <Text
                      style={[
                        styles.stepText,
                        {color: theme.colors.onSurface},
                      ]}>
                      {step.streetName || step.name || 'Strada sconosciuta'}{' '}
                      {step.distance_m
                        ? `— ${Math.round(step.distance_m)} m`
                        : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 8,
  },
  divider: {marginBottom: 12},
  segmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    elevation: 4,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modeTitle: {fontSize: 15, fontWeight: '700'},
  timeInfo: {fontSize: 12, marginTop: 4},
  distanceInfo: {fontSize: 12, marginTop: 2, fontStyle: 'italic'}, // ✅ coerente graficamente
  chipContainer: {marginTop: 8, flexDirection: 'row'},
  routeChip: {
    borderWidth: 1.5,
    marginRight: 8,
  },
  stepsContainer: {marginTop: 8},
  stepsDivider: {marginBottom: 8},
  stepRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  stepText: {fontSize: 13, marginLeft: 6},
  stopHeader: {fontWeight: '700', marginBottom: 4},
  stopItem: {fontSize: 13, marginLeft: 8, marginBottom: 2},
  emptyContainer: {padding: 20, alignItems: 'center'},
  emptyText: {fontStyle: 'italic', fontSize: 14},
});
