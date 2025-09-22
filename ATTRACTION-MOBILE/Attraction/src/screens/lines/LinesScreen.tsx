// src/screens/lines/LinesScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import {
  Text,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import Geolocation from "react-native-geolocation-service";

interface TransportLine {
  id: string;
  ref: string;
  name?: string;
  operator?: string;
  from?: string;
  to?: string;
}

const normalizeOperatorName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("amaco")) return "AMACO";
  if (lower.includes("ferrovie della calabria")) return "Ferrovie della Calabria";
  if (lower.includes("flixbus")) return "FlixBus";
  if (lower.includes("trenitalia")) return "Trenitalia";
  return name.trim();
};

export default function LinesScreen() {
  const [value, setValue] = useState("bus");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [busLines, setBusLines] = useState<Record<string, TransportLine[]>>({});
  const [trainLines, setTrainLines] = useState<Record<string, TransportLine[]>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  // Geolocalizzazione
  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  useEffect(() => {
    const initLocation = async () => {
      try {
        if (Platform.OS === "ios") {
          const authStatus = await Geolocation.requestAuthorization("whenInUse");
          if (authStatus !== "granted") {
            setError("Permesso di localizzazione negato");
            return;
          }
        }
        const pos = await getCurrentLocation();
        setLocation(pos);
      } catch (err) {
        console.error("Errore geolocalizzazione:", err);
        setError("Errore nella geolocalizzazione");
      }
    };
    initLocation();
  }, []);

  // Fetch linee bus
  const fetchBusLines = async (userLocation: { lat: number; lon: number }) => {
    try {
      setError(null);

      const query = `
        [out:json][timeout:25];
        (
          relation["route"="bus"](around:20000, ${userLocation.lat}, ${userLocation.lon});
          relation["route_master"="bus"](around:20000, ${userLocation.lat}, ${userLocation.lon});
          node["highway"="bus_stop"](around:20000, ${userLocation.lat}, ${userLocation.lon});
        );
        out body;
      `;

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
      const json = await res.json();

      const grouped: Record<string, TransportLine[]> = {};

      json.elements.forEach((el: any) => {
        // CASO 1: Linee bus
        if (el.type === "relation" && el.tags && el.tags.ref) {
          const operator = normalizeOperatorName(
            el.tags.operator || el.tags.network || "Operatore sconosciuto"
          );
          const line: TransportLine = {
            id: String(el.id),
            ref: el.tags.ref,
            name: el.tags.name,
            operator,
            from: el.tags.from,
            to: el.tags.to,
          };
          if (!grouped[operator]) grouped[operator] = [];
          const exists = grouped[operator].some(
            (existingLine) => existingLine.ref === line.ref
          );
          if (!exists) grouped[operator].push(line);
        }
        // CASO 2: Fermate bus
        if (el.type === "node" && el.tags && el.tags.operator) {
          const operator = normalizeOperatorName(el.tags.operator);
          if (!grouped[operator]) grouped[operator] = [];
          const stopLine: TransportLine = {
            id: String(el.id),
            ref: el.tags.name || "Fermata",
            name: el.tags.name || "Fermata bus",
            operator,
          };
          const exists = grouped[operator].some(
            (existingLine) => existingLine.ref === stopLine.ref
          );
          if (!exists) grouped[operator].push(stopLine);
        }
      });

      Object.keys(grouped).forEach((operator) => {
        grouped[operator].sort((a, b) => {
          const aNum = parseInt(a.ref);
          const bNum = parseInt(b.ref);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return a.ref.localeCompare(b.ref);
        });
      });

      setBusLines(grouped);
    } catch (err) {
      console.error("Errore fetch bus lines:", err);
      setError("Errore nel caricamento delle linee bus. Riprova più tardi.");
    }
  };

  // Fetch linee treno (con fallback stazioni)
  const fetchTrainLines = async (userLocation: { lat: number; lon: number }) => {
    try {
      setError(null);

      const query = `
        [out:json][timeout:25];
        (
          relation["route"="train"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route_master"="train"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route"="light_rail"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route_master"="light_rail"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route"="subway"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route_master"="subway"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route"="railway"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          relation["route_master"="railway"](around:50000, ${userLocation.lat}, ${userLocation.lon});
          node["railway"="station"](around:50000, ${userLocation.lat}, ${userLocation.lon});
        );
        out body;
      `;

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
      const json = await res.json();

      const grouped: Record<string, TransportLine[]> = {};

      json.elements.forEach((el: any) => {
        // CASO 1: Linee ferroviarie
        if (el.type === "relation" && el.tags && el.tags.ref) {
          const operator = normalizeOperatorName(
            el.tags.operator || el.tags.network || "Operatore sconosciuto"
          );
          const line: TransportLine = {
            id: String(el.id),
            ref: el.tags.ref,
            name: el.tags.name,
            operator,
            from: el.tags.from,
            to: el.tags.to,
          };
          if (!grouped[operator]) grouped[operator] = [];
          const exists = grouped[operator].some(
            (existingLine) => existingLine.ref === line.ref
          );
          if (!exists) grouped[operator].push(line);
        }
        // CASO 2: Stazioni ferroviarie (fallback)
        if (el.type === "node" && el.tags && el.tags.railway === "station") {
          const operator = normalizeOperatorName(el.tags.operator || "Stazione");
          if (!grouped[operator]) grouped[operator] = [];
          const station: TransportLine = {
            id: String(el.id),
            ref: "Stazione",
            name: el.tags.name || "Stazione ferroviaria",
            operator,
          };
          const exists = grouped[operator].some(
            (existingLine) => existingLine.name === station.name
          );
          if (!exists) grouped[operator].push(station);
        }
      });

      Object.keys(grouped).forEach((operator) => {
        grouped[operator].sort((a, b) => a.ref.localeCompare(b.ref));
      });

      setTrainLines(grouped);
    } catch (err) {
      console.error("Errore fetch train lines:", err);
      setError("Errore nel caricamento delle linee treno. Riprova più tardi.");
    }
  };

  // carica dati quando ho la location
  useEffect(() => {
    if (!location) return;
    const loadLines = async () => {
      setLoading(true);
      await fetchBusLines(location);
      await fetchTrainLines(location);
      setLoading(false);
    };
    loadLines();
  }, [location]);

  const onRefresh = async () => {
    if (!location) return;
    setRefreshing(true);
    await fetchBusLines(location);
    await fetchTrainLines(location);
    setRefreshing(false);
  };

  const renderLines = (lines: Record<string, TransportLine[]>, type: "bus" | "train") => {
    if (loading && Object.keys(lines).length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating size="large" />
          <Text style={styles.loadingText}>Caricamento linee {type}...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    if (Object.keys(lines).length === 0 && !loading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Nessuna linea {type} trovata nella tua zona
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={Object.keys(lines)}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: operator }) => (
          <View style={styles.operatorBlock}>
            <Text style={[styles.operatorTitle, { color: theme.colors.primary }]}>
              {operator}
            </Text>
            {lines[operator].map((line) => (
              <View key={line.id} style={styles.lineRow}>
                <Text style={[styles.lineRef, { color: theme.colors.secondary }]}>
                  {line.ref}
                </Text>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>
                    {line.name || `Linea ${type}`}
                  </Text>
                  {line.from && line.to && (
                    <Text style={styles.lineSubtitle}>
                      {line.from} ↔ {line.to}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          {
            value: "bus",
            label: "Bus",
            style: {
              backgroundColor:
                value === "bus" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "bus"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
              fontWeight: "bold",
            },
          },
          {
            value: "train",
            label: "Treni",
            style: {
              backgroundColor:
                value === "train" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "train"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
              fontWeight: "bold",
            },
          },
          {
            value: "favorites",
            label: "Preferiti",
            style: {
              backgroundColor:
                value === "favorites" ? theme.colors.primary : "transparent",
            },
            labelStyle: {
              color:
                value === "favorites"
                  ? theme.colors.onPrimary
                  : theme.colors.onSurface,
              fontWeight: "bold",
            },
          },
        ]}
        style={styles.segmented}
      />

      <View style={styles.content}>
        {value === "bus" && (
          <>
            <Text variant="titleLarge" style={styles.title}>
              Linee Bus nella tua zona
            </Text>
            {renderLines(busLines, "bus")}
          </>
        )}
        {value === "train" && (
          <>
            <Text variant="titleLarge" style={styles.title}>
              Linee Treni nella tua zona
            </Text>
            {renderLines(trainLines, "treno")}
          </>
        )}
        {value === "favorites" && <Text variant="titleLarge">Preferiti</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  segmented: { marginBottom: 20 },
  content: { flex: 1 },
  title: { marginBottom: 10, fontWeight: "bold" },
  operatorBlock: { marginBottom: 20 },
  operatorTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 18,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  lineRef: {
    fontWeight: "bold",
    fontSize: 16,
    minWidth: 60,
    textAlign: "center",
  },
  lineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lineName: {
    fontSize: 15,
    fontWeight: "600",
  },
  lineSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 16, textAlign: "center" },
  errorText: { textAlign: "center", fontSize: 16 },
  emptyText: { textAlign: "center", fontSize: 16 },
  listContainer: { paddingBottom: 20 },
});








