import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { useGetSearchesQuery } from "../../store/api/searchApi";
import { reverseGeocode as reverseGeocodeUtil } from "../../utils/reverseGeocode";

interface RecentSearchesProps {
  onSelect: (item: any) => void;
  reverseGeocode?: (lat: number, lon: number) => Promise<string>;
}

export default function RecentSearches({ onSelect, reverseGeocode }: RecentSearchesProps) {
  const theme = useTheme();
  const { data: allSearches = [], isLoading } = useGetSearchesQuery();

  const validSearches = allSearches.filter(
    (s) => s.from_lat !== 0 && s.to_lat !== 0
  );

  const recentSearches = [...validSearches].slice(-6).reverse();

  const [resolvedNames, setResolvedNames] = useState<
    Record<number, { from: string; to: string }>
  >({});

  // Usa la prop se fornita, altrimenti la util condivisa
  const doReverse = reverseGeocode ?? reverseGeocodeUtil;

  useEffect(() => {
    const resolveAll = async () => {
      try {
        const results = await Promise.all(
          recentSearches.map(async (item) => {
            const fromName = await doReverse(item.from_lat, item.from_lon);
            const toName = await doReverse(item.to_lat, item.to_lon);
            return [item.id, { from: fromName, to: toName }] as const;
          })
        );
        setResolvedNames(Object.fromEntries(results));
      } catch (err) {
        console.error("Errore durante la risoluzione nomi:", err);
      }
    };
    if (recentSearches.length > 0) resolveAll();
  }, [recentSearches, doReverse]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Caricamento...
        </Text>
      </View>
    );
  }

  if (recentSearches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Nessuna ricerca salvata
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.recentSection}>
      <Text style={[styles.recentTitle, { color: theme.colors.onSurface }]}>
        Tratte recenti
      </Text>

      {recentSearches.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.recentItem,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.fromText, { color: theme.colors.primary }]}>
            ↑ {resolvedNames[item.id]?.from || "Caricamento..."}
          </Text>
          <Text style={[styles.toText, { color: theme.colors.error }]}>
            ↓ {resolvedNames[item.id]?.to || "Caricamento..."}
          </Text>
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
            {new Date(item.trip_date).toLocaleString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
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
    marginBottom: 4,
    fontSize: 15,
  },
  toText: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 15,
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
  },
});

