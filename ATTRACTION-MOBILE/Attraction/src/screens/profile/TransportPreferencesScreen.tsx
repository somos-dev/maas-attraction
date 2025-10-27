import React, {useState} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import {
  Text,
  RadioButton,
  useTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import AppCard from '../../components/common/card/AppCard';
import {
  useGetPlacesQuery,
  useDeletePlaceMutation,
} from '../../store/api/placesApi';

export default function TransportPreferencesScreen() {
  const theme = useTheme();
  const [routePref, setRoutePref] = useState('fastest');

  // Query per i luoghi preferiti
  const {data: placesResponse, isLoading, error, refetch} = useGetPlacesQuery();

  // Mutation per eliminare un luogo
  const [deletePlace, {isLoading: deleting}] = useDeletePlaceMutation();

  // I dati reali dei luoghi
  const favoritePlaces = placesResponse?.data ?? [];

  const handleDelete = (id: number, address: string) => {
    Alert.alert(
      'Conferma eliminazione',
      `Vuoi rimuovere "${address}" dai preferiti?`,
      [
        {text: 'Annulla', style: 'cancel'},
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlace(id).unwrap();
              refetch(); // aggiorna lista
            } catch (err) {
              console.error('❌ Errore eliminazione luogo:', err);
              Alert.alert(
                'Errore',
                'Impossibile eliminare il luogo preferito.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={[styles.title, {color: theme.colors.onBackground}]}>
          Impostazioni
        </Text>
      </View> */}

      {/* Tipo di Percorso */}
      <AppCard title="Tipo di Percorso">
        <RadioButton.Group
          onValueChange={value => setRoutePref(value)}
          value={routePref}>
          <RadioButton.Item
            label="Più veloce"
            value="fastest"
            color={theme.colors.primary}
            labelStyle={[styles.optionLabel, {color: theme.colors.onSurface}]}
            style={styles.radioItem}
          />
          <RadioButton.Item
            label="Eco-sostenibile"
            value="eco"
            color={theme.colors.primary}
            labelStyle={[styles.optionLabel, {color: theme.colors.onSurface}]}
            style={styles.radioItem}
          />
          <RadioButton.Item
            label="A piedi"
            value="walk"
            color={theme.colors.primary}
            labelStyle={[styles.optionLabel, {color: theme.colors.onSurface}]}
            style={styles.radioItem}
          />
        </RadioButton.Group>
      </AppCard>

      {/* Luoghi Preferiti */}
      <AppCard title="Luoghi Preferiti">
        {isLoading && (
          <ActivityIndicator animating={true} color={theme.colors.primary} />
        )}

        {error && (
          <View style={{marginVertical: 8}}>
            <Text style={{color: theme.colors.error, fontWeight: 'bold'}}>
              Errore nel caricamento dei luoghi
            </Text>
            <Text
              style={{color: theme.colors.error, fontSize: 12, marginTop: 4}}>
              {typeof error === 'object'
                ? `Status: ${
                    'status' in error ? error.status : '?'
                  }, Body: ${JSON.stringify(
                    'data' in error ? error.data : error,
                  )}`
                : String(error)}
            </Text>
          </View>
        )}

        {!isLoading && !error && favoritePlaces.length > 0
          ? favoritePlaces.map(place => (
              <View key={place.id} style={styles.placeItem}>
                <View style={{flex: 1}}>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.placeTitle,
                      {color: theme.colors.onSurface},
                    ]}>
                    {place.address}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.placeAddress,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    Tipo:{' '}
                    {place.type === 'home'
                      ? 'Casa'
                      : place.type === 'work'
                      ? 'Lavoro'
                      : 'Altro'}
                  </Text>
                </View>

                <IconButton
                  icon="delete-outline"
                  size={24}
                  iconColor={theme.colors.error}
                  onPress={() => handleDelete(place.id, place.address)}
                  disabled={deleting}
                />
              </View>
            ))
          : !isLoading &&
            !error && (
              <Text style={{color: theme.colors.onSurfaceVariant}}>
                Nessun luogo preferito
              </Text>
            )}
      </AppCard>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  radioItem: {
    paddingVertical: 4,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingBottom: 8,
  },
  placeTitle: {
    fontWeight: '600',
  },
  placeAddress: {
    marginTop: 2,
    opacity: 0.8,
  },
  bottomSpacer: {
    height: 40,
  },
});
