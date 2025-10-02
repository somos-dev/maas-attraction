// src/screens/main/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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

// Funzione helper per fare reverse geocoding con Nominatim
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "AttractionApp/1.0" },
    });
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
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

  // Quando arrivano le ricerche, risolvi i nomi tramite Nominatim (ottimizzato con Promise.all)
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

  // nuova ricerca
  const handleSearch = async () => {
    if (!from || !to) return;

    // salva nello storico backend
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

    // calcola itinerario
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

  // usa tratta dallo storico
  const handleUseRecent = async (item: any) => {
    console.log("▶️ handleUseRecent - item:", item);

    // Normalizza la data come in handleSearch
    const tripDate = new Date(item.trip_date);
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const formattedDate = `${tripDate.getFullYear()}-${pad(
      tripDate.getMonth() + 1
    )}-${pad(tripDate.getDate())}`;
    const formattedTime = `${pad(tripDate.getHours())}:${pad(
      tripDate.getMinutes()
    )}:${pad(tripDate.getSeconds())}`;

    const params = {
      fromLat: item.from_lat,
      fromLon: item.from_lon,
      toLat: item.to_lat,
      toLon: item.to_lon,
      date: formattedDate,
      time: formattedTime,
      requested_date: formattedDate,
      requested_time: formattedTime,
      mode: item.modes?.toLowerCase() || "all",
    };

    console.log("▶️ handleUseRecent - params inviati:", params);

    try {
      const foundRoutes = await fetchTrip(params);
      console.log("▶️ handleUseRecent - routes trovate:", foundRoutes);
      navigation.navigate("Results", { routes: foundRoutes });
    } catch (err) {
      console.error("❌ Errore handleUseRecent:", err);
    }
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
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
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
        >
          {loading ? "Ricerca in corso..." : "Cerca Soluzioni"}
        </Button>

        {/* Storico */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Tratte recenti</Text>
          {loadingSearches ? (
            <Text>Caricamento...</Text>
          ) : recentSearches.length === 0 ? (
            <Text>Nessuna ricerca salvata</Text>
          ) : (
            recentSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItem}
                onPress={() => handleUseRecent(item)}
              >
                <Text style={styles.fromText}>
                  ↑ {resolvedNames[item.id]?.from || "Caricamento..."}
                </Text>
                <Text style={styles.toText}>
                  ↓ {resolvedNames[item.id]?.to || "Caricamento..."}
                </Text>
                <Text style={styles.dateText}>{item.trip_date}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Snackbar errori */}
      <Snackbar visible={!!error} onDismiss={() => {}}>
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  checkboxLabel: { fontSize: 16 },
  cta: { marginTop: 16, borderRadius: 8, paddingVertical: 8 },
  recentSection: { marginTop: 24 },
  recentTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  recentItem: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fromText: { fontWeight: "600", color: "green", marginBottom: 2 },
  toText: { fontWeight: "600", color: "red", marginBottom: 4 },
  dateText: { fontSize: 12, color: "gray" },
});

