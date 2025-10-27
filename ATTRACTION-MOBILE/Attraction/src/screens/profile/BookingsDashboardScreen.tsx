import React, {useEffect, useMemo, useRef} from 'react';
import {View, ScrollView, StyleSheet, Animated, Easing} from 'react-native';
import {Text, useTheme, ActivityIndicator, Divider} from 'react-native-paper';
import {useGetBookingsQuery} from '../../store/api/bookingApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BookingsDashboardScreen() {
  const theme = useTheme();
  const {data: bookings, isLoading, isError} = useGetBookingsQuery();

  // 🔹 Aggregazioni totali
  const totals = useMemo(() => {
    if (!bookings?.length) return {km: 0, co2: 0, saved: 0};
    let km = 0,
      co2 = 0,
      saved = 0;
    bookings.forEach(b => {
      km += b.distance_km || 0;
      co2 += b.co2_kg || 0;
      saved += b.co2_saved_kg || 0;
    });
    return {km, co2, saved};
  }, [bookings]);

  // 🔹 Livelli gamificati
  const levels = [
    {label: 'Eco Beginner 🌿', threshold: 10},
    {label: 'Eco Explorer 🌱', threshold: 25},
    {label: 'Green Rider 🚴‍♂️', threshold: 50},
    {label: 'Climate Hero 🌎', threshold: 100},
  ];

  const currentLevel =
    levels.find(lvl => totals.saved < lvl.threshold) ||
    levels[levels.length - 1];
  const nextThreshold =
    levels.find(lvl => totals.saved < lvl.threshold)?.threshold ||
    currentLevel.threshold;
  const progressValue = Math.min(totals.saved / nextThreshold, 1);

  // 🔹 Animazione progress bar
  const animatedProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progressValue,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressValue]);

  const widthInterpolated = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Caricamento dei tuoi spostamenti...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{color: theme.colors.error}}>
          Errore nel caricamento dei dati.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}
      showsVerticalScrollIndicator={false}>
      {/* 🎮 HEADER GAMIFICATO */}
      <View style={styles.header}>
        <Text style={[styles.levelText, {color: theme.colors.primary}]}>
          {currentLevel.label}
        </Text>
        <Text
          style={[styles.progressSub, {color: theme.colors.onSurfaceVariant}]}>
          Hai risparmiato {totals.saved.toFixed(1)} kg di CO₂
        </Text>

        <View
          style={[
            styles.progressBar,
            {backgroundColor: theme.colors.surfaceVariant},
          ]}>
          <Animated.View
            style={[
              styles.progressFill,
              {backgroundColor: theme.colors.primary, width: widthInterpolated},
            ]}
          />
        </View>

        <Text
          style={[styles.progressSub, {color: theme.colors.onSurfaceVariant}]}>
          {progressValue >= 1
            ? '🎉 Hai raggiunto un nuovo livello!'
            : `Prossimo livello a ${nextThreshold} kg`}
        </Text>
      </View>

      {/* 📊 STATISTICHE GLOBALI */}
      <View style={styles.statsRow}>
        <StatBox
          icon="map-marker-distance"
          label="Km Totali"
          value={`${totals.km.toFixed(1)} km`}
          color={theme.colors.primary}
        />
        <StatBox
          icon="leaf"
          label="CO₂ Risparmiata"
          value={`${totals.saved.toFixed(2)} kg`}
          color={theme.colors.secondary}
        />
        <StatBox
          icon="factory"
          label="CO₂ Emessa"
          value={`${totals.co2.toFixed(2)} kg`}
          color={theme.colors.error}
        />
      </View>

      {/* 🚗 STORICO SPOSTAMENTI */}
      <View style={styles.sectionHeader}>
        <Icon name="history" size={20} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
          I tuoi ultimi spostamenti
        </Text>
      </View>

      {!bookings?.length ? (
        <Text
          style={{
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            marginTop: 12,
          }}>
          Nessun viaggio registrato finora.
        </Text>
      ) : (
        bookings.slice(0, 10).map((b, i) => (
          <View key={b.id} style={[styles.tripItem]}>
            <View style={styles.tripIcon}>
              <Icon
                name={b.mode?.toLowerCase() === 'bus' ? 'bus' : 'train'}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.tripContent}>
              <Text style={[styles.tripTitle, {color: theme.colors.onSurface}]}>
                {b.origin} → {b.destination}
              </Text>
              <Text
                style={[
                  styles.tripSub,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                {formatDate(b.time)} · {b.mode}
              </Text>

              <View style={styles.badgesRow}>
                {b.distance_km ? (
                  <Text style={[styles.badge, {color: theme.colors.primary}]}>
                    🚗 {b.distance_km.toFixed(1)} km
                  </Text>
                ) : null}
                {b.co2_saved_kg ? (
                  <Text style={[styles.badge, {color: theme.colors.secondary}]}>
                    🌱 +{b.co2_saved_kg.toFixed(2)} kg
                  </Text>
                ) : null}
              </View>
            </View>
            {i < bookings.length - 1 && <Divider style={styles.tripDivider} />}
          </View>
        ))
      )}
    </ScrollView>
  );
}

// 🔹 COMPONENTE STATBOX
const StatBox = ({icon, label, value, color}: any) => (
  <View style={[styles.statBox, {borderColor: color}]}>
    <Icon name={icon} size={26} color={color} />
    <Text style={[styles.statLabel]}>{label}</Text>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 22,
    fontWeight: '700',
  },
  progressSub: {
    fontSize: 13,
    marginTop: 4,
  },
  progressBar: {
    width: '80%',
    height: 10,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  tripIcon: {
    width: 36,
    alignItems: 'center',
    marginTop: 4,
  },
  tripContent: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  tripSub: {
    fontSize: 13,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
  },
  tripDivider: {
    marginTop: 10,
    opacity: 0.3,
  },
});
