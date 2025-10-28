import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Searchbar,
  List,
  ActivityIndicator,
  useTheme,
  IconButton,
  Snackbar,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useCurrentLocation} from '../../hooks/useCurrentLocation';
import {
  useGetPlacesQuery,
  useCreatePlaceMutation,
} from '../../store/api/placesApi';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';

export interface Place {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: string;
}

interface PlaceSearchModalProps {
  visible: boolean;
  type: 'from' | 'to';
  query: string;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  results: Place[];
  loading: boolean;
  error?: string;
  onSelect: (place: Place) => void;
}

export default function PlaceSearchModal({
  visible,
  type,
  query,
  onClose,
  onQueryChange,
  results,
  loading,
  error,
  onSelect,
}: PlaceSearchModalProps) {
  const theme = useTheme();
  const {access} = useSelector((state: RootState) => state.auth);
  const {location, fetchLocation} = useCurrentLocation();
  const [createPlace] = useCreatePlaceMutation();

  const {
    data: rawData,
    isFetching,
    refetch,
  } = useGetPlacesQuery(undefined, {
    skip: !access,
  });

  const favoritePlaces = rawData?.data ?? [];

  const [localQuery, setLocalQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [favoriteModalVisible, setFavoriteModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Dati del form per salvataggio preferito
  const [favAddress, setFavAddress] = useState('');
  const [favType, setFavType] = useState<'Casa' | 'Lavoro' | 'Altro'>('Casa');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalQuery('');
      onQueryChange('');
    }
  }, [visible]);

  const handleQueryChange = (text: string) => {
    setLocalQuery(text);
    onQueryChange(text);
  };

  const handleSelect = async (place: Place) => {
    if (place.category === 'current') {
      await fetchLocation();
      if (location) {
        onSelect({
          name: 'Posizione Attuale',
          address: 'La tua posizione',
          lat: location.lat,
          lon: location.lon,
          category: 'current',
        });
      } else {
        Alert.alert(
          'Posizione non disponibile',
          'Assicurati che i permessi GPS siano attivi.',
        );
      }
    } else {
      onSelect(place);
    }
    onClose();
  };

  const openFavoriteModal = (place: Place) => {
    if (!access) {
      Alert.alert(
        'Accesso richiesto',
        'Accedi per salvare luoghi tra i preferiti.',
      );
      return;
    }
    setSelectedPlace(place);
    setFavAddress(place.address || place.name);
    setFavType('Casa');
    setFavoriteModalVisible(true);
  };

  const handleAddFavorite = async () => {
    if (!selectedPlace || !favAddress.trim()) return;
    try {
      setIsSaving(true);

      const mappedType =
        favType === 'Casa'
          ? 'home'
          : favType === 'Lavoro'
          ? 'work'
          : 'favorites';

      const latitude = Number(selectedPlace.lat ?? location?.lat ?? 0);
      const longitude = Number(selectedPlace.lon ?? location?.lon ?? 0);

      await createPlace({
        address: favAddress.trim(),
        type: mappedType,
        latitude,
        longitude,
      }).unwrap();

      setFavoriteModalVisible(false);
      setSnackbarVisible(true);
      refetch();

      console.log('📍 Payload inviato:', {
        address: favAddress.trim(),
        type: mappedType,
        latitude,
        longitude,
      });
    } catch (err) {
      console.error('❌ Errore salvataggio preferito:', err);
      Alert.alert('Errore', 'Impossibile aggiungere ai preferiti.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'current':
        return 'crosshairs-gps';
      case 'station':
        return 'train';
      case 'airport':
        return 'airplane';
      case 'recent':
        return 'clock-outline';
      case 'favorite':
        return 'star';
      default:
        return 'map-marker';
    }
  };

  const displayData = localQuery.length >= 2 ? results : [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
        <View style={styles.container}>
          {/* Header */}
          <View
            style={[styles.header, {backgroundColor: theme.colors.background}]}>
            <IconButton icon="arrow-left" size={24} onPress={onClose} />
            <Text style={styles.headerTitle}>
              {type === 'from' ? 'Punto di partenza' : 'Destinazione'}
            </Text>
            <View style={{width: 48}} />
          </View>

          {/* Searchbar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Cerca città, indirizzi o punti di interesse"
              onChangeText={handleQueryChange}
              placeholderTextColor="#666"
              inputStyle={{color: theme.colors.onSurface}}
              value={localQuery}
              style={styles.searchbar}
              autoFocus
              elevation={2}
            />
          </View>

          {/* 🔹 Posizione Attuale */}
          <View style={styles.currentLocationContainer}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={async () => {
                await fetchLocation();
                if (location) {
                  onSelect({
                    name: 'Posizione Attuale',
                    address: 'La tua posizione',
                    lat: location.lat,
                    lon: location.lon,
                    category: 'current',
                  });
                  onClose();
                } else {
                  Alert.alert(
                    'Posizione non disponibile',
                    'Assicurati che i permessi GPS siano attivi.',
                  );
                }
              }}>
              <Icon
                name="crosshairs-gps"
                size={22}
                color={theme.colors.primary}
                style={{marginRight: 10}}
              />
              <Text style={{fontSize: 16, color: theme.colors.onSurface}}>
                Usa la mia posizione attuale
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🔹 Preferiti */}
          {access && favoritePlaces.length > 0 && (
            <View style={styles.quickSelectContainer}>
              <View style={styles.quickSelectHeader}>
                <Text style={styles.quickSelectLabel}>
                  I tuoi luoghi preferiti
                </Text>
                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={() => refetch()}
                  disabled={isFetching}
                />
              </View>

              <View style={styles.quickSelectRow}>
                {favoritePlaces.map((p: any) => {
                  let icon = 'star-outline';
                  if (p.type === 'home') icon = 'home';
                  else if (p.type === 'work') icon = 'briefcase';

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.quickButton}
                      onPress={() => {
                        onSelect({
                          name: p.address,
                          address: p.address,
                          lat: p.latitude ?? 0,
                          lon: p.longitude ?? 0,
                          category: 'favorite',
                        });
                        onClose();
                      }}>
                      <Icon
                        name={icon}
                        size={26}
                        color={theme.colors.primary}
                      />
                      <Text numberOfLines={1} style={styles.quickButtonText}>
                        {p.address.length > 20
                          ? p.address.slice(0, 20) + '…'
                          : p.address}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Ricerca in corso...</Text>
            </View>
          )}

          {/* Risultati */}
          {!loading && !error && (
            <FlatList
              data={displayData}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              contentContainerStyle={styles.listContent}
              renderItem={({item}) => (
                <View style={styles.listRow}>
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={{flex: 1}}
                    activeOpacity={0.7}>
                    <List.Item
                      title={item.name}
                      description={item.address}
                      left={() => (
                        <Icon
                          name={getCategoryIcon(item.category)}
                          size={24}
                          color={theme.colors.primary}
                          style={{marginRight: 12}}
                        />
                      )}
                    />
                  </TouchableOpacity>

                  <IconButton
                    icon="star-outline"
                    size={34}
                    onPress={() => openFavoriteModal(item)}
                  />
                </View>
              )}
            />
          )}
        </View>

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{backgroundColor: theme.colors.secondary}}>
          Luogo aggiunto ai preferiti
        </Snackbar>

        {/* 🔹 Modale Aggiungi Preferito */}
        <Modal
          visible={favoriteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFavoriteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.favoriteModal}>
              <Text style={styles.modalTitle}>Aggiungi ai preferiti</Text>

              <TextInput
                label="Indirizzo"
                value={favAddress}
                onChangeText={setFavAddress}
                mode="outlined"
                outlineStyle={{borderRadius: 12}}
                style={styles.input}
                left={<TextInput.Icon icon="map-marker-outline" />}
              />

              <Text style={styles.label}>Tipo</Text>
              <Button
                mode="outlined"
                onPress={() => {
                  const next =
                    favType === 'Casa'
                      ? 'Lavoro'
                      : favType === 'Lavoro'
                      ? 'Altro'
                      : 'Casa';
                  setFavType(next);
                }}
                icon={
                  favType === 'Casa'
                    ? 'home'
                    : favType === 'Lavoro'
                    ? 'briefcase'
                    : 'star-outline'
                }
                contentStyle={{justifyContent: 'space-between'}}
                style={styles.dropdownButton}>
                {favType}
              </Button>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#666',
                  marginTop: 4,
                }}>
                Tocca per cambiare tipo
              </Text>

              <Button
                mode="contained"
                onPress={handleAddFavorite}
                style={styles.saveButton}
                contentStyle={{paddingVertical: 8}}
                labelStyle={{fontSize: 16, fontWeight: '600'}}
                disabled={isSaving || !favAddress.trim()}>
                {isSaving ? (
                  <ActivityIndicator animating={true} color="white" />
                ) : (
                  'Salva'
                )}
              </Button>

              <Button
                onPress={() => setFavoriteModalVisible(false)}
                mode="text"
                style={{marginTop: 6}}>
                Annulla
              </Button>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {fontSize: 18, fontWeight: 'bold'},
  searchContainer: {padding: 12},
  searchbar: {elevation: 2, backgroundColor: 'white', fontSize: 16},

  // Posizione attuale
  currentLocationContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },

  listRow: {flexDirection: 'row', alignItems: 'center', paddingRight: 8},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {marginTop: 12, color: '#666', fontSize: 16},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteModal: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 14,
    backgroundColor: 'white',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: '#333',
  },
  dropdownButton: {
    borderRadius: 12,
    borderColor: '#ccc',
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  quickSelectContainer: {
    marginBottom: 14,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  quickSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickSelectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  quickButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: 100,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
});
