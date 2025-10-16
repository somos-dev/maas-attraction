// src/screens/home/HomeScreen.tsx
import React, {useMemo, useRef, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {View, StyleSheet, Dimensions} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import MapView from '../../components/maps/MapView';
import SearchBottomSheet from '../../components/search/SearchBottomSheet';
import {useTheme} from 'react-native-paper';

const {height} = Dimensions.get('window');

export default function HomeScreen({navigation}: any) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [height * 0.25, height * 0.5, height * 0.75],
    [],
  );
  const route = useRoute();
  const prefill = route.params?.prefill;

  useEffect(() => {
    if (prefill) {
      // qui passiamo i dati al SearchBottomSheet tramite ref o prop
      console.log('📍 Ricevuto prefill:', prefill);
    }
  }, [prefill]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* Mappa sotto */}
      <View style={styles.mapContainer}>
        <MapView />
      </View>

      {/* BottomSheet sopra */}
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        // ✅ background dinamico in base al tema
        backgroundStyle={{
          backgroundColor: theme.dark
            ? theme.colors.background // Dark mode: scuro
            : theme.colors.background, // Light mode: chiaro
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: theme.dark ? 'transparent' : '#000',
          elevation: theme.dark ? 0 : 5,
        }}>
        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}>
          <SearchBottomSheet navigation={navigation} prefill={prefill} />
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
  bottomSheetContent: {
    padding: 16,
  },
});
