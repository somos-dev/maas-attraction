import React, {useMemo, useRef, useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions, Alert} from 'react-native';
import {Text, useTheme, Button, Snackbar} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView from '../../components/maps/MapView';
import RouteDetails from '../../components/trip/RouteDetails';
import {useCreateBookingMutation} from '../../store/api/bookingApi';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store'; // 🔹 importa il tipo del root state

const {height} = Dimensions.get('window');

const OTP_GRAPHQL_URL =
  'https://otp.somos.srl/otp/routers/default/index/graphql';

const ROUTE_DETAILS_QUERY = `
  query RouteDetails($routeId: String!) {
    route(id: $routeId) {
      gtfsId
      shortName
      longName
      mode
      color
      textColor
      agency { name }
      patterns {
        id
        name
        stops { name lat lon }
      }
    }
  }
`;

async function fetchRouteDetails(routeId: string) {
  try {
    const res = await fetch(OTP_GRAPHQL_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        query: ROUTE_DETAILS_QUERY,
        variables: {routeId},
      }),
    });
    const json = await res.json();
    return json.data?.route || null;
  } catch (err) {
    console.error('Errore nel recupero dettagli bus:', err);
    return null;
  }
}

export default function TripDetailsScreen({route}: any) {
  const theme = useTheme();
  const trip = route.params?.trip;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(
    () => [height * 0.25, height * 0.55, height * 0.85],
    [],
  );

  const [showSheet, setShowSheet] = useState(false);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false); // 🔹 nuovo stato locale

  // 🔹 RTK Mutation
  const [createBooking, {isLoading}] = useCreateBookingMutation();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // 🔹 Auth
  const {access} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSheet(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (trip?.legs?.length) {
      const busLeg = trip.legs.find(
        (leg: any) => leg.mode?.toLowerCase() === 'bus',
      );
      if (busLeg?.route) {
        fetchRouteDetails(busLeg.route).then(info => {
          setBusInfo(info);
        });
      }
    }
  }, [trip]);

  const handleConfirmTrip = async () => {
    if (!trip) return;

    try {
      const body = {
        origin: trip.fromStationName,
        destination: trip.toStationName,
        time: new Date().toISOString(),
        mode: trip.legs?.[0]?.mode || 'BUS',
        distance_km: trip.distance,
        total_distance_m: Math.round(trip.distance * 1000),
      };

      console.log('📦 Sending booking:', body);

      await createBooking(body).unwrap();

      setConfirmed(true); // ✅ segna come confermato
      setSnackbarVisible(true);
    } catch (err) {
      console.error('❌ Errore invio booking:', err);
      Alert.alert('Errore', 'Impossibile confermare il viaggio.');
    }
  };

  if (!trip) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <Icon
          name="map-marker-off"
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[styles.emptyText, {color: theme.colors.onSurfaceVariant}]}>
          Nessun viaggio disponibile
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* Mappa */}
      <View style={styles.mapContainer} pointerEvents="box-none">
        <MapView
          ref={mapRef}
          route={trip}
          showStops
          showMarkers
          highlightColor={theme.colors.primary}
        />
      </View>

      {/* BottomSheet */}
      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleIndicatorStyle={{
            backgroundColor: theme.colors.onSurfaceVariant,
          }}
          enablePanDownToClose={false}>
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.bottomSheetContent,
              {backgroundColor: theme.colors.surface},
            ]}
            keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.headerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}>
              <Text
                style={[styles.headerTitle, {color: theme.colors.onSurface}]}>
                {trip.fromStationName} → {trip.toStationName}
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                Durata: {trip.duration} min · Distanza: {trip.distance} km
              </Text>

              {/* 🔹 Se non loggato */}
              {!access && (
                <Text
                  style={[
                    styles.loginNotice,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  🔒 Accedi per salvare le informazioni di viaggio
                </Text>
              )}

              {/* 🔹 Se loggato e non ancora confermato */}
              {access && !confirmed && (
                <Button
                  mode="contained"
                  style={styles.confirmBtn}
                  onPress={handleConfirmTrip}
                  loading={isLoading}>
                  Conferma viaggio
                </Button>
              )}

              {/* 🔹 Se già confermato */}
              {access && confirmed && (
                <Text
                  style={[
                    styles.confirmedText,
                    {color: theme.colors.primary, fontWeight: '600'},
                  ]}>
                  ✅ Viaggio confermato
                </Text>
              )}
            </View>

            <RouteDetails route={trip} busInfo={busInfo} />
          </BottomSheetScrollView>
        </BottomSheet>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{backgroundColor: theme.colors.primary}}>
        ✅ Viaggio confermato con successo!
      </Snackbar>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {flex: 1, zIndex: 0},
  bottomSheetContent: {padding: 20},
  headerContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  loginNotice: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  confirmBtn: {
    marginTop: 4,
    borderRadius: 8,
  },
  confirmedText: {
    marginTop: 6,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
});
