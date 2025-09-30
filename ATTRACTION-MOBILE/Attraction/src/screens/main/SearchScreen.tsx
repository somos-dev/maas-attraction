import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Text, Button, Checkbox, useTheme, Snackbar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import PlaceButton from "../../components/search/PlaceButton";
import SwapButton from "../../components/search/SwapButton";
import DateTimeSelector from "../../components/search/DateTimeSelector";
import PlaceSearchModal from "../../components/search/PlaceSearchModal";

import { useTrip } from "../../hooks/useTrip";
import { usePlaces, Place } from "../../hooks/usePlaces";

export default function SearchScreen({ navigation }: any) {
  const theme = useTheme();
  const { routes, loading, error, fetchTrip } = useTrip();
  const { results, loading: searching, error: searchError, search } = usePlaces();

  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"from" | "to">("from");
  const [query, setQuery] = useState("");

  // helper
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const formattedDate = `${dateTime.getFullYear()}-${pad(dateTime.getMonth() + 1)}-${pad(dateTime.getDate())}`;
  const formattedTime = `${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}:${pad(dateTime.getSeconds())}`;

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
      mode: "all" as const,
    };

    console.log("fetchTrip params:", params);
    const foundRoutes = await fetchTrip(params);

    // 👇 naviga subito, anche se lista vuota
    navigation.navigate("Results", { routes: foundRoutes });
  };

  const openModal = (type: "from" | "to") => {
    setModalType(type);
    setQuery("");
    setModalVisible(true);
  };

  const handleSelectPlace = (place: Place) => {
    if (modalType === "from") {
      setFrom(place);
    } else {
      setTo(place);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  cta: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 8,
  },
});
