import { useState } from "react";

export interface Place {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: string;
}

let searchTimeout: NodeJS.Timeout;

export function usePlaces() {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const search = async (query: string) => {
    // Reset se la query è troppo corta
    if (query.length < 2) {
      setResults([]);
      setError("");
      return;
    }

    // Debounce: aspetta 500ms dopo l'ultimo carattere
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}&` +
            `format=json&` +
            `countrycodes=it&` +
            `limit=15&` +
            `addressdetails=1&` +
            `accept-language=it`,
          {
            headers: {
              "User-Agent": "AttractionApp/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Errore nella ricerca");
        }

        const data = await response.json();

        if (data.length === 0) {
          setError("Nessun risultato trovato. Prova con un altro termine.");
          setResults([]);
          return;
        }

        // Formatta i risultati
        const places: Place[] = data.map((item: any) => {
          const parts = item.display_name.split(",").map((s: string) => s.trim());
          let name = parts[0];

          // Se il nome è troppo generico, prendi i primi 2 elementi
          if (name.length < 3 && parts.length > 1) {
            name = parts.slice(0, 2).join(", ");
          }

          const address = parts.slice(1).join(", ");

          return {
            name: name,
            address: address || item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            category: item.type || "place",
          };
        });

        setResults(places);
      } catch (err) {
        console.error("Errore ricerca luoghi:", err);
        setError("Errore di connessione. Riprova.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return {
    results,
    loading,
    error,
    search,
  };
}

