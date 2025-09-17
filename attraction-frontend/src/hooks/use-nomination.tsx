
import { useEffect, useState } from "react";



export interface NominatimResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  importance: number;
  icon?: string;
  type?: string;
}


export function useNominatimSearch(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isNomLoading, setIsNomLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    if (query.length < 3) {return setResults([])};
    const timeout = setTimeout(() => {
      setIsNomLoading(true)
      fetch(`/api/nominatim/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((res)=>{
          setResults(res)
          setIsNomLoading(false)
        }
        )
        .catch(() => { setIsNomLoading(false) });
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return {results, isNomLoading};
}


export async function reverseNominatim(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/nominatim/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    // You can adjust which field you want to use as the display name
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse Nominatim error:', error);
    return null;
  }
}