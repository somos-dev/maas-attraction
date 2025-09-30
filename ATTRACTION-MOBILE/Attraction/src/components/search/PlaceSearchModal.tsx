import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import {
  Text,
  Searchbar,
  List,
  ActivityIndicator,
  useTheme,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useCurrentLocation } from "../../hooks/useCurrentLocation"; // 👈 import hook

export interface Place {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: string;
}

interface PlaceSearchModalProps {
  visible: boolean;
  type: "from" | "to";
  query: string;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  results: Place[];
  loading: boolean;
  error?: string;
  onSelect: (place: Place) => void;
}

const recentPlaces: Place[] = [
  {
    name: "Posizione Attuale",
    address: "Usa la tua posizione GPS",
    lat: 0, // placeholder, verrà aggiornato dal GPS
    lon: 0,
    category: "current",
  },
];

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
  const [localQuery, setLocalQuery] = useState("");

  // hook posizione
  const { location, fetchLocation } = useCurrentLocation();

  // Reset query quando si apre il modal
  useEffect(() => {
    if (visible) {
      setLocalQuery("");
      onQueryChange("");
    }
  }, [visible]);

  const handleQueryChange = (text: string) => {
    setLocalQuery(text);
    onQueryChange(text);
  };

  const handleSelect = async (place: Place) => {
    if (place.category === "current") {
      await fetchLocation(); // aggiorna posizione
      if (location) {
        onSelect({
          name: "Posizione Attuale",
          address: "La tua posizione",
          lat: location.lat,
          lon: location.lon,
          category: "current",
        });
      } else {
        onSelect(place); // fallback placeholder
      }
    } else {
      onSelect(place);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "current": return "crosshairs-gps";
      case "station": return "train";
      case "airport": return "airplane";
      case "recent": return "clock-outline";
      case "favorite": return "star";
      default: return "map-marker";
    }
  };

  const displayData = localQuery.length >= 2 ? results : recentPlaces;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <SafeAreaView 
        style={[
          styles.safeArea, 
          { backgroundColor: theme.colors.background }
        ]}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={onClose}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>
              {type === "from" ? "Punto di partenza" : "Destinazione"}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Cerca città, indirizzi o punti di interesse"
              onChangeText={handleQueryChange}
              placeholderTextColor="#666"
              inputStyle={{ color: theme.colors.onSurface }}
              value={localQuery}
              style={styles.searchbar}
              autoFocus
              elevation={2}
            />
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Ricerca in corso...</Text>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
              <Text style={[styles.emptyText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Results List */}
          {!loading && !error && (
            <FlatList
              data={displayData}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={() => (
                localQuery.length < 2 && recentPlaces.length > 0 ? (
                  <Text style={styles.sectionHeader}>Ricerche rapide</Text>
                ) : null
              )}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <List.Item
                    title={item.name}
                    description={item.address}
                    titleNumberOfLines={2}
                    descriptionNumberOfLines={2}
                    style={styles.listItem}
                    left={() => (
                      <View style={styles.iconContainer}>
                        <Icon
                          name={getCategoryIcon(item.category)}
                          size={24}
                          color={theme.colors.primary}
                        />
                      </View>
                    )}
                    right={() => (
                      <Icon
                        name="chevron-right"
                        size={24}
                        color="#ccc"
                      />
                    )}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                !loading && !error ? (
                  localQuery.length >= 2 ? (
                    <View style={styles.emptyContainer}>
                      <Icon name="map-marker-off" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>Nessun risultato trovato</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Icon name="magnify" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>
                        Inserisci almeno 2 caratteri per cercare
                      </Text>
                      <Text style={styles.hintText}>
                        Puoi cercare città, indirizzi o punti di interesse in tutta Italia
                      </Text>
                    </View>
                  )
                ) : null
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 48,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  searchbar: {
    elevation: 2,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  listItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: "#999",
    textAlign: "center",
    fontSize: 16,
  },
  hintText: {
    marginTop: 8,
    color: "#bbb",
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 32,
  },
});

