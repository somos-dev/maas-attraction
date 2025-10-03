// src/screens/main/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Checkbox, useTheme, Snackbar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import PlaceButton from "../../components/search/PlaceButton";
import SwapButton from "../../components/search/SwapButton";
import DateTimeSelector from "../../components/search/DateTimeSelector";
import PlaceSearchModal from "../../components/search/PlaceSearchModal";

import { useTrip } from "../../hooks/useTrip";
import { usePlaces, Place } from "../../hooks/usePlaces";
import {
  useGetSearchesQuery,
  useCreateSearchMutation,
} from "../../store/api/searchApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const MAX_CONTENT_WIDTH = 600; // Massima larghezza per tablet

// 🔹 Cache per reverse geocoding
const reverseCache = new Map<string, string>();

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  if (reverseCache.has(key)) return reverseCache.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "AttractionApp/1.0" },
    });
    const data = await res.json();
    const name = data?.display_name || key;
    reverseCache.set(key, name);
    return name;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return key;
  }
}

export default function SearchScreen({ navigation }: any) {
  const theme = useTheme();
  const { fetchTrip, loading, error } = useTrip();
  const { results, loading: searching, error: searchError, search } = usePlaces();

  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"from" | "to">("from");
  const [query, setQuery] = useState("");

  // API search → storico + creare nuove ricerche
  const { data: allSearches = [], isLoading: loadingSearches } =
    useGetSearchesQuery();
  const recentSearches = [...allSearches].slice(-5).reverse(); // ultime 5
  const [createSearch] = useCreateSearchMutation();

  // Stato locale per salvare i nomi "reverse"
  const [resolvedNames, setResolvedNames] = useState<
    Record<number, { from: string; to: string }>
  >({});

  // 🔹 Risolvi nomi tramite Nominatim (ottimizzato con Promise.all + cache)
  useEffect(() => {
    const resolveAll = async () => {
      try {
        const results = await Promise.all(
          recentSearches.map(async (item) => {
            const fromName = await reverseGeocode(item.from_lat, item.from_lon);
            const toName = await reverseGeocode(item.to_lat, item.to_lon);
            return [item.id, { from: fromName, to: toName }] as const;
          })
        );
        setResolvedNames(Object.fromEntries(results));
      } catch (err) {
        console.error("Errore durante la risoluzione nomi:", err);
      }
    };
    if (recentSearches.length > 0) resolveAll();
  }, [recentSearches]);

  // helper date
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const formattedDate = `${dateTime.getFullYear()}-${pad(
    dateTime.getMonth() + 1
  )}-${pad(dateTime.getDate())}`;
  const formattedTime = `${pad(dateTime.getHours())}:${pad(
    dateTime.getMinutes()
  )}:${pad(dateTime.getSeconds())}`;

  // 🔹 nuova ricerca
  const handleSearch = async () => {
    if (!from || !to) return;

    await createSearch({
      from_lat: from.lat,
      from_lon: from.lon,
      to_lat: to.lat,
      to_lon: to.lon,
      from_name: from.name,
      to_name: to.name,
      trip_date: formattedDate,
      modes: "all",
    }).unwrap();

    const params = {
      fromLat: from.lat,
      fromLon: from.lon,
      toLat: to.lat,
      toLon: to.lon,
      date: formattedDate,
      time: formattedTime,
      requested_date: formattedDate,
      requested_time: formattedTime,
      mode: "all" as const,
    };

    const foundRoutes = await fetchTrip(params);
    navigation.navigate("Results", { routes: foundRoutes });
  };

  // 🔹 usa tratta dallo storico → riempie i campi, NON va subito ai risultati
  const handleUseRecent = (item: any) => {
    setFrom({
      lat: item.from_lat,
      lon: item.from_lon,
      name: resolvedNames[item.id]?.from || "",
    });
    setTo({
      lat: item.to_lat,
      lon: item.to_lon,
      name: resolvedNames[item.id]?.to || "",
    });
  };

  const openModal = (type: "from" | "to") => {
    setModalType(type);
    setQuery("");
    setModalVisible(true);
  };

  const handleSelectPlace = (place: Place) => {
    if (modalType === "from") setFrom(place);
    else setTo(place);
    setModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            <View style={styles.inner}>
              <Text style={styles.title}>Calcola Percorso</Text>

              <PlaceButton
                label="Partenza"
                value={from?.name}
                address={from?.address}
                icon="arrow-up-circle-outline"
                onPress={() => openModal("from")}
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
                onPress={() => openModal("to")}
              />

              {/* Andata/Ritorno */}
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={roundTrip ? "checked" : "unchecked"}
                  onPress={() => setRoundTrip(!roundTrip)}
                />
                <Text style={styles.checkboxLabel}>Andata/Ritorno</Text>
              </View>

              <DateTimeSelector
                date={dateTime}
                onSelectDate={() => setShowPicker("date")}
                onSelectTime={() => setShowPicker("time")}
              />

              {showPicker && (
                <DateTimePicker
                  value={dateTime}
                  mode={showPicker}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(e, d) => {
                    // Su Android il picker si chiude automaticamente
                    if (Platform.OS === "android") {
                      setShowPicker(null);
                    }
                    if (d) setDateTime(d);
                  }}
                  // Su iOS aggiungiamo un bottone di conferma
                  {...(Platform.OS === "ios" && {
                    style: styles.iosDatePicker,
                  })}
                />
              )}

              <Button
                mode="contained"
                style={styles.cta}
                onPress={handleSearch}
                disabled={!from || !to || loading}
                labelStyle={styles.ctaLabel}
              >
                {loading ? "Ricerca in corso..." : "Cerca Soluzioni"}
              </Button>

              {/* Storico */}
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Tratte recenti</Text>
                {loadingSearches ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Caricamento...</Text>
                  </View>
                ) : recentSearches.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nessuna ricerca salvata</Text>
                  </View>
                ) : (
                  recentSearches.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentItem}
                      onPress={() => handleUseRecent(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.fromText} numberOfLines={1}>
                        ↑ {resolvedNames[item.id]?.from || "Caricamento..."}
                      </Text>
                      <Text style={styles.toText} numberOfLines={1}>
                        ↓ {resolvedNames[item.id]?.to || "Caricamento..."}
                      </Text>
                      <Text style={styles.dateText}>{item.trip_date}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar errori */}
      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={3000}
        style={styles.snackbar}
      >
        Errore durante la ricerca. Riprova.
      </Snackbar>

      <PlaceSearchModal
        visible={modalVisible}
        type={modalType}
        query={query}
        onClose={() => setModalVisible(false)}
        onQueryChange={(q) => {
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
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 32,
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  inner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    paddingTop: Platform.OS === "android" ? 8 : 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 8 : 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    marginLeft: -8, // Allinea meglio la checkbox
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  cta: {
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 8,
    elevation: Platform.OS === "android" ? 2 : 0,
    shadowColor: Platform.OS === "ios" ? "#000" : undefined,
    shadowOffset: Platform.OS === "ios" ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === "ios" ? 0.1 : undefined,
    shadowRadius: Platform.OS === "ios" ? 4 : undefined,
  },
  ctaLabel: {
    paddingVertical: Platform.OS === "android" ? 4 : 8,
    fontSize: 16,
    fontWeight: "600",
  },
  recentSection: {
    marginTop: 32,
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  recentItem: {
    padding: 14,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  fromText: {
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 4,
    fontSize: 15,
  },
  toText: {
    fontWeight: "600",
    color: "#c62828",
    marginBottom: 6,
    fontSize: 15,
  },
  dateText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    fontStyle: "italic",
  },
  iosDatePicker: {
    backgroundColor: "#fff",
    marginHorizontal: HORIZONTAL_PADDING,
    marginVertical: 10,
  },
  snackbar: {
    marginBottom: Platform.OS === "ios" ? 0 : 16,
  },
});



