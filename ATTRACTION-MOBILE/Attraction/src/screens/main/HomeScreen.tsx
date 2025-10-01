// src/screens/home/HomeScreen.tsx
import React, { useMemo, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MapView from "../../components/maps/MapView";
import QuickSearchBottomSheet from "../../components/search/QuickSearchBottomSheet";

const { height } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height * 0.25, height * 0.5, height * 0.75], []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Mappa sotto */}
      <View style={styles.mapContainer}>
        <MapView />
      </View>

      {/* BottomSheet sopra */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground} // 👈 sfondo bianco visibile
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          <QuickSearchBottomSheet navigation={navigation} />
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    zIndex: 0,
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetContent: {
    padding: 16,
  },
});







