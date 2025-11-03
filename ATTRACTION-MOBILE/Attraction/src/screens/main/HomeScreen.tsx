import React, {useState, useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import MapView from '../../components/maps/MapView';
import SearchBottomSheet from '../../components/search/SearchBottomSheet';

const {height} = Dimensions.get('window');

export default function HomeScreen({navigation}: any) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [height * 0.25, height * 0.5, height * 0.75],
    [],
  );

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null,
  );
  const [prefill, setPrefill] = useState<any>(null);

  // 🔹 In HomeScreen.tsx
  const handleSetPoint = (type: 'from' | 'to') => {
    if (!selectedCoords) return;
    const [lon, lat] = selectedCoords;

    const updatedPrefill = {
      from_lat: prefill?.from_lat ?? null,
      from_lon: prefill?.from_lon ?? null,
      to_lat: prefill?.to_lat ?? null,
      to_lon: prefill?.to_lon ?? null,
      ...(type === 'from'
        ? {from_lat: lat, from_lon: lon}
        : {to_lat: lat, to_lon: lon}),
    };

    console.log('🟢 Nuovo prefill creato:', updatedPrefill);

    // ✅ crea un nuovo oggetto e forza re-render del bottomsheet
    setPrefill(updatedPrefill);
    setPopupVisible(false);
  };

  const handleLongPress = (coords: [number, number]) => {
    setSelectedCoords(coords);
    setPopupVisible(true);
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.mapContainer}>
        <MapView
          onLongPress={handleLongPress}
          selectedCoords={selectedCoords}
        />
      </View>

      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
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

      <Modal visible={popupVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>Seleziona azione</Text>
            <Text style={styles.popupSubtitle}>
              Vuoi impostare questo punto come origine o destinazione?
            </Text>

            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.primaryButton]}
                onPress={() => handleSetPoint('from')}>
                <Text style={[styles.popupButtonText, styles.primaryText]}>
                  Imposta come partenza
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.popupButton, styles.secondaryButton]}
                onPress={() => handleSetPoint('to')}>
                <Text style={[styles.popupButtonText, styles.secondaryText]}>
                  Imposta come destinazione
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setPopupVisible(false)}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {flex: 1},
  bottomSheetContent: {padding: 16},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popupContainer: {
    backgroundColor: '#fff',
    width: 280,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  popupSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  popupButtons: {
    width: '100%',
    marginBottom: 10,
  },
  popupButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
  },
  popupButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#222',
  },
  cancelText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'underline',
  },
});
