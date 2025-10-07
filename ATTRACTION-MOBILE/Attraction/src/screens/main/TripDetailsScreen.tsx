import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView from "../../components/maps/MapView";
import RouteDetails from "../../components/trip/RouteDetails";

const { height } = Dimensions.get("window");

export default function TripDetailsScreen({ route }: any) {
  const theme = useTheme();
  const trip = route.params?.trip;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(() => [height * 0.25, height * 0.55, height * 0.85], []);

  //  Monta la BottomSheet dopo che la mappa è pronta
  const [showSheet, setShowSheet] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShowSheet(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="map-marker-off" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Nessun viaggio disponibile</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Mappa interattiva */}
      <View style={styles.mapContainer} pointerEvents="box-none">
        <MapView
          ref={mapRef}
          route={trip}
          showStops
          showMarkers
          highlightColor={theme.colors.primary}
        />
      </View>

      {/* BottomSheet montata dopo 300ms */}
      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          enablePanDownToClose={false}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                {trip.fromStationName} → {trip.toStationName}
              </Text>
              <Text style={styles.headerSubtitle}>
                Durata: {trip.duration} min · Distanza: {trip.distance} km
              </Text>
            </View>

            <RouteDetails route={trip} />
          </BottomSheetScrollView>
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, zIndex: 0 },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetContent: { padding: 16 },
  headerContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 13, color: "#666" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12, fontWeight: "500" },
});


