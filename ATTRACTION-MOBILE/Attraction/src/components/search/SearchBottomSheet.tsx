import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, useTheme, Snackbar} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import PlaceButton from './PlaceButton';
import SwapButton from './SwapButton';
import DateTimeSelector from './DateTimeSelector';
import PlaceSearchModal from './PlaceSearchModal';

import {useTrip} from '../../hooks/useTrip';
import {usePlaces, Place} from '../../hooks/usePlaces';

interface Props {
  navigation: any;
  prefill?: {
    from_lat: number;
    from_lon: number;
    to_lat: number;
    to_lon: number;
  };
}

export default function SearchBottomSheet({navigation, prefill}: Props) {
  const theme = useTheme();
  const {routes, loading, error, fetchTrip} = useTrip();
  const {results, loading: searching, error: searchError, search} = usePlaces();

  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'from' | 'to'>('from');
  const [query, setQuery] = useState('');

  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const formattedDate = `${dateTime.getFullYear()}-${pad(
    dateTime.getMonth() + 1,
  )}-${pad(dateTime.getDate())}`;
  const formattedTime = `${pad(dateTime.getHours())}:${pad(
    dateTime.getMinutes(),
  )}:${pad(dateTime.getSeconds())}`;

  useEffect(() => {
    if (!prefill) return;

    console.log('🔁 Prefill ricevuto nel BottomSheet:', prefill);

    // 🔹 aggiorna Partenza solo se ci sono coordinate
    if (prefill.from_lat && prefill.from_lon) {
      setFrom({
        name: 'Partenza selezionata sulla mappa',
        address: '',
        lat: prefill.from_lat,
        lon: prefill.from_lon,
      });
    }

    // 🔹 aggiorna Destinazione solo se ci sono coordinate
    if (prefill.to_lat && prefill.to_lon) {
      setTo({
        name: 'Destinazione selezionata sulla mappa',
        address: '',
        lat: prefill.to_lat,
        lon: prefill.to_lon,
      });
    }
  }, [prefill]); // 👈 non singole proprietà: l’oggetto intero

  const handleSearch = async () => {
    if (!from || !to) return;
    const params = {
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      date: formattedDate,
      time: formattedTime,
      requested_date: formattedDate,
      requested_time: formattedTime,
      roundTrip: false, // 👈 tolto il toggle
      mode: 'all' as const,
    };

    const foundRoutes = await fetchTrip(params);
    navigation.navigate('Results', {routes: foundRoutes});
  };

  const openModal = (type: 'from' | 'to') => {
    setModalType(type);
    setQuery('');
    setModalVisible(true);
  };

  const handleSelectPlace = (place: Place) => {
    if (modalType === 'from') setFrom(place);
    else setTo(place);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <Text style={[styles.title, {color: theme.colors.onSurface}]}>
        Trova il tuo percorso
      </Text>

      {/* Riga Partenza con pulsante swap */}
      <View style={styles.row}>
        <View style={{flex: 1}}>
          <PlaceButton
            label="Partenza"
            value={from?.name}
            address={from?.address}
            icon="arrow-up-circle-outline"
            onPress={() => openModal('from')}
          />
        </View>

        <SwapButton
          onPress={() => {
            const temp = from;
            setFrom(to);
            setTo(temp);
          }}
          disabled={!from && !to}
          iconColor={theme.colors.onSurfaceVariant}
          style={styles.swapButton}
        />
      </View>

      {/* Destinazione */}
      <PlaceButton
        label="Destinazione"
        value={to?.name}
        address={to?.address}
        icon="arrow-down-circle-outline"
        onPress={() => openModal('to')}
      />

      {/* Data e ora */}
      <DateTimeSelector
        date={dateTime}
        onSelectDate={() => setShowPicker('date')}
        onSelectTime={() => setShowPicker('time')}
        textColor={theme.colors.onSurface}
      />

      {showPicker && (
        <DateTimePicker
          value={dateTime}
          mode={showPicker}
          display="default"
          onChange={(e, d) => {
            setShowPicker(null);
            if (d) setDateTime(d);
          }}
        />
      )}

      <Button
        mode="contained"
        style={styles.cta}
        onPress={handleSearch}
        disabled={!from || !to || loading}
        textColor={theme.colors.onPrimary}>
        {loading ? 'Ricerca in corso...' : 'Cerca soluzioni'}
      </Button>

      <Snackbar visible={!!error} onDismiss={() => {}}>
        Errore durante la ricerca. Riprova.
      </Snackbar>

      <PlaceSearchModal
        visible={modalVisible}
        type={modalType}
        query={query}
        onClose={() => setModalVisible(false)}
        onQueryChange={q => {
          setQuery(q);
          search(q);
        }}
        results={results}
        loading={searching}
        error={searchError}
        onSelect={handleSelectPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  swapButton: {
    marginLeft: 6,
    alignSelf: 'center',
  },
  cta: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 6,
  },
});
