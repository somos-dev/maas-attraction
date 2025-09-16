import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { TextInput, Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//  Tipo per i risultati
interface Place {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: "Università" | "Stazione" | "Città" | "Altro";
}

interface SearchScreenProps {
  navigation: any;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [osmResults, setOsmResults] = useState<Place[]>([]);
  const [localResults, setLocalResults] = useState<Place[]>([]); //  fallback dataset interno
  const [isLoading, setIsLoading] = useState(false);

  //  Ricerca OSM
  const searchOSM = useCallback(
    debounce(async (text: string) => {
      if (text.length < 3) {
        setOsmResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            text
          )}&format=json&limit=10&countrycodes=it&addressdetails=1&extratags=1&namedetails=1`,
          {
            headers: {
              "User-Agent": "attraction-app/1.0 (info@somos.srl)",
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const formatted = data.map(formatSearchResult);
        setOsmResults(formatted);
      } catch (err) {
        console.error("Errore ricerca OSM:", err);
        setOsmResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    []
  );

  //  Mock dataset interno (università / stazioni locali)
  const fetchLocalResults = (text: string) => {
    const dataset: Place[] = [
      {
        name: "Università della Calabria",
        address: "Arcavacata di Rende (CS)",
        category: "Università",
        lat: 39.3642,
        lon: 16.2266,
      },
      {
        name: "Stazione Cosenza Vaglio Lise",
        address: "Cosenza",
        category: "Stazione",
        lat: 39.309,
        lon: 16.258,
      },
    ];

    return dataset.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
  };

  useEffect(() => {
    if (query.trim()) {
      searchOSM(query.trim());
      setLocalResults(fetchLocalResults(query.trim()));
    } else {
      setOsmResults([]);
      setLocalResults([]);
      setIsLoading(false);
    }
  }, [query, searchOSM]);

  //  Selezione risultato
  const handleSelectPlace = (place: Place) => {
    navigation.navigate("Results", { place });
  };

  const clearSearch = () => {
    setQuery("");
    setOsmResults([]);
    setLocalResults([]);
  };

  //  Formattazione risultati OSM
  const formatSearchResult = (item: any): Place => {
    const parts = item.display_name.split(", ");
    const name = item.namedetails?.name || parts[0];
    const address = parts.slice(1, 3).join(", ");

    let category: Place["category"] = "Altro";
    if (item.class === "amenity" && item.type === "university") category = "Università";
    if (item.class === "railway") category = "Stazione";
    if (item.class === "place" && ["city", "town", "village"].includes(item.type))
      category = "Città";

    return {
      name,
      address,
      category,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    };
  };

  //  Icona per categoria
  const getCategoryIcon = (category: Place["category"]) => {
    switch (category) {
      case "Università":
        return "school-outline";
      case "Stazione":
        return "train";
      case "Città":
        return "city";
      default:
        return "map-marker";
    }
  };

  //  Merge risultati (priorità categorie)
  const mergedResults = [...localResults, ...osmResults].sort((a, b) => {
    const order = { Università: 0, Stazione: 1, Città: 2, Altro: 3 };
    return order[a.category] - order[b.category];
  });

  //  Render risultato
  const renderSearchResult = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSelectPlace(item)}
    >
      <View style={styles.row}>
        <Icon
          name={getCategoryIcon(item.category)}
          size={22}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.primaryText, { color: theme.colors.onSurface }]}>
            {item.name}
          </Text>
          {item.address ? (
            <Text
              style={[
                styles.secondaryText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.address}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/*  Barra di ricerca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Dove vuoi andare?"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          right={
            query ? <TextInput.Icon icon="close" onPress={clearSearch} /> : undefined
          }
          autoFocus
          returnKeyType="search"
        />
      </View>

      {/*  Lista risultati */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
            >
              Ricerca in corso...
            </Text>
          </View>
        ) : (
          <FlatList
            data={mergedResults}
            keyExtractor={(_, index) => `result-${index}`}
            renderItem={renderSearchResult}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query.length >= 3 ? (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Nessun risultato trovato
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Inizia a digitare per cercare una destinazione
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

//  Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: { backgroundColor: "transparent" },
  content: { flex: 1 },
  loadingContainer: { padding: 32, alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  primaryText: { fontSize: 16, fontWeight: "500" },
  secondaryText: { fontSize: 14 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: { fontSize: 15, textAlign: "center" },
});










