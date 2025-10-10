// src/components/search/SearchBottomSheet.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Checkbox,
  Text,
  useTheme,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import PlaceButton from "./PlaceButton";
import SwapButton from "./SwapButton";
import DateTimeSelector from "./DateTimeSelector";
import PlaceSearchModal from "./PlaceSearchModal";

import { useTrip } from "../../hooks/useTrip";
import { usePlaces, Place } from "../../hooks/usePlaces";

interface Props {
  navigation: any;
}

export default function SearchBottomSheet({ navigation }: Props) {
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

  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const formattedDate = `${dateTime.getFullYear()}-${pad(
    dateTime.getMonth() + 1
  )}-${pad(dateTime.getDate())}`;
  const formattedTime = `${pad(dateTime.getHours())}:${pad(
    dateTime.getMinutes()
  )}:${pad(dateTime.getSeconds())}`;

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
      roundTrip,
      mode: "all" as const,
    };

    console.log("fetchTrip params:", params);
    const foundRoutes = await fetchTrip(params);
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
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.colors.onSurface },
        ]}
      >
        Trova il tuo percorso
      </Text>

      {/* Campo Partenza */}
      <PlaceButton
        label="Partenza"
        value={from?.name}
        address={from?.address}
        icon="arrow-up-circle-outline"
        onPress={() => openModal("from")}
        iconColor={theme.colors.onSurface} // ✅ colore dinamico
      />

      {/* Scambio */}
      <SwapButton
        onPress={() => {
          const temp = from;
          setFrom(to);
          setTo(temp);
        }}
        disabled={!from && !to}
        iconColor={theme.colors.onSurface} // ✅ colore dinamico
      />

      {/* Campo Destinazione */}
      <PlaceButton
        label="Destinazione"
        value={to?.name}
        address={to?.address}
        icon="arrow-down-circle-outline"
        onPress={() => openModal("to")}
        iconColor={theme.colors.onSurface} // ✅ colore dinamico
      />

      {/* Andata/Ritorno */}
      <View style={styles.checkboxRow}>
        <Checkbox
          status={roundTrip ? "checked" : "unchecked"}
          onPress={() => setRoundTrip(!roundTrip)}
          color={theme.colors.primary} // ✅ visibile su dark e light
          uncheckedColor={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            styles.checkboxLabel,
            { color: theme.colors.onSurface },
          ]}
        >
          Andata/Ritorno
        </Text>
      </View>

      {/* Data/Ora */}
      <DateTimeSelector
        date={dateTime}
        onSelectDate={() => setShowPicker("date")}
        onSelectTime={() => setShowPicker("time")}
        textColor={theme.colors.onSurface} // ✅ miglior contrasto
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

      {/* Bottone ricerca */}
      <Button
        mode="contained"
        style={styles.cta}
        onPress={handleSearch}
        disabled={!from || !to || loading}
        textColor={theme.colors.onPrimary}
      >
        {loading ? "Ricerca in corso..." : "Cerca Soluzioni"}
      </Button>

      {/* Snackbar errori */}
      <Snackbar visible={!!error} onDismiss={() => {}}>
        Errore durante la ricerca. Riprova.
      </Snackbar>

      {/* Modal ricerca luoghi */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
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
