import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Button, Checkbox, useTheme, Snackbar} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import PlaceButton from '../../components/search/PlaceButton';
import SwapButton from '../../components/search/SwapButton';
import DateTimeSelector from '../../components/search/DateTimeSelector';
import PlaceSearchModal from '../../components/search/PlaceSearchModal';
import RecentSearches from '../../components/search/RecentSearches';

import {useTrip} from '../../hooks/useTrip';
import {usePlaces, Place} from '../../hooks/usePlaces';
import {useCreateSearchMutation} from '../../store/api/searchApi';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {useCreatePlaceMutation} from '../../store/api/placesApi';
import {useRoute} from '@react-navigation/native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const MAX_CONTENT_WIDTH = 600;

const reverseCache = new Map<string, string>();

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  if (reverseCache.has(key)) return reverseCache.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: {'User-Agent': 'AttractionApp/1.0'},
    });
    const data = await res.json();
    const name = data?.display_name || key;
    reverseCache.set(key, name);
    return name;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return key;
  }
}

export default function SearchScreen({navigation}: any) {
  const route = useRoute();
  const prefill = route.params?.prefill;

  useEffect(() => {
    if (!route.params?.prefill) return;

    const {from_lat, from_lon, to_lat, to_lon} = route.params.prefill;

    // Aggiorna "Partenza" se fornita
    if (from_lat && from_lon) {
      reverseGeocode(from_lat, from_lon).then(name => {
        setFrom({
          lat: from_lat,
          lon: from_lon,
          name: name || 'Punto di partenza',
        });
      });
    }

    // Aggiorna "Destinazione" se fornita
    if (to_lat && to_lon) {
      reverseGeocode(to_lat, to_lon).then(name => {
        setTo({
          lat: to_lat,
          lon: to_lon,
          name: name || 'Destinazione',
        });
      });
    }

    console.log(
      '📍 Aggiornato dinamicamente da prefill:',
      route.params.prefill,
    );
  }, [route.params?.prefill]);

  const theme = useTheme();
  const {fetchTrip, loading, error} = useTrip();
  const {results, loading: searching, error: searchError, search} = usePlaces();

  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'from' | 'to'>('from');
  const [query, setQuery] = useState('');

  const [createSearch] = useCreateSearchMutation();
  const {access} = useSelector((state: RootState) => state.auth); // 🔹 token JWT, se presente

  // helper date
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const formattedDate = `${dateTime.getFullYear()}-${pad(
    dateTime.getMonth() + 1,
  )}-${pad(dateTime.getDate())}`;
  const formattedTime = `${pad(dateTime.getHours())}:${pad(
    dateTime.getMinutes(),
  )}:${pad(dateTime.getSeconds())}`;

  // 🔹 nuova ricerca (funziona anche per anonimi)
  const handleSearch = async () => {
    if (!from || !to) return;

    try {
      if (access) {
        await createSearch({
          from_lat: from.lat,
          from_lon: from.lon,
          to_lat: to.lat,
          to_lon: to.lon,
          from_name: from.name,
          to_name: to.name,
          trip_date: formattedDate,
          modes: 'all',
        }).unwrap();
      } else {
        console.warn(
          'Utente anonimo: ricerca non salvata ma procedo al calcolo del percorso.',
        );
      }
    } catch (err) {
      console.warn(
        'Errore o utente anonimo durante il salvataggio, continuo la ricerca.',
      );
    }

    const params = {
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      date: formattedDate,
      time: formattedTime,
      requested_date: formattedDate,
      requested_time: formattedTime,
      mode: 'all' as const,
    };

    const foundRoutes = await fetchTrip(params);
    navigation.navigate('Results', {routes: foundRoutes});
  };

  // 🔹 usa tratta dallo storico → riempie i campi
  const handleUseRecent = (item: any) => {
    reverseGeocode(item.from_lat, item.from_lon).then(fromName => {
      reverseGeocode(item.to_lat, item.to_lon).then(toName => {
        setFrom({
          lat: item.from_lat,
          lon: item.from_lon,
          name: fromName,
        });
        setTo({
          lat: item.to_lat,
          lon: item.to_lon,
          name: toName,
        });
      });
    });
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
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentWrapper}>
            <View style={styles.inner}>
              <Text style={styles.title}>Calcola Percorso</Text>

              <PlaceButton
                label="Partenza"
                value={from?.name}
                address={from?.address}
                icon="arrow-up-circle-outline"
                onPress={() => openModal('from')}
              />

              <SwapButton
                onPress={() => {
                  const temp = from;
                  setFrom(to);
                  setTo(temp);
                }}
                disabled={!from && !to}
              />

              <PlaceButton
                label="Destinazione"
                value={to?.name}
                address={to?.address}
                icon="arrow-down-circle-outline"
                onPress={() => openModal('to')}
              />

              {/* Andata/Ritorno */}
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={roundTrip ? 'checked' : 'unchecked'}
                  onPress={() => setRoundTrip(!roundTrip)}
                />
                <Text style={styles.checkboxLabel}>Andata/Ritorno</Text>
              </View>

              <DateTimeSelector
                date={dateTime}
                onSelectDate={() => setShowPicker('date')}
                onSelectTime={() => setShowPicker('time')}
              />

              {showPicker && (
                <DateTimePicker
                  value={dateTime}
                  mode={showPicker}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => {
                    if (Platform.OS === 'android') setShowPicker(null);
                    if (d) setDateTime(d);
                  }}
                  {...(Platform.OS === 'ios' && {
                    style: styles.iosDatePicker,
                  })}
                />
              )}

              <Button
                mode="contained"
                style={styles.cta}
                onPress={handleSearch}
                disabled={!from || !to || loading}
                labelStyle={styles.ctaLabel}>
                {loading ? 'Ricerca in corso...' : 'Cerca Soluzioni'}
              </Button>

              {/* 🔹 Storico (solo se loggato) */}
              {access && (
                <RecentSearches
                  onSelect={handleUseRecent}
                  reverseGeocode={reverseGeocode}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar errori */}
      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={3000}
        style={styles.snackbar}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardView: {flex: 1},
  scrollContent: {flexGrow: 1, paddingBottom: Platform.OS === 'ios' ? 20 : 32},
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 8 : 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginLeft: -8,
  },
  checkboxLabel: {fontSize: 16, marginLeft: 4},
  cta: {
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? {width: 0, height: 2} : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  },
  ctaLabel: {
    paddingVertical: Platform.OS === 'android' ? 4 : 8,
    fontSize: 16,
    fontWeight: '600',
  },
  iosDatePicker: {
    backgroundColor: '#fff',
    marginHorizontal: HORIZONTAL_PADDING,
    marginVertical: 10,
  },
  snackbar: {marginBottom: Platform.OS === 'ios' ? 0 : 16},
});
