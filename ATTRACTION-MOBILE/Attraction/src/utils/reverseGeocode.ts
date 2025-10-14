// src/utils/reverseGeocode.ts
// Reverse geocoding con cache in-memory e fallback su "lat, lon".
// Se in futuro vuoi, puoi aggiungere persistenza con AsyncStorage.

const mem = new Map<string, string>();

/** Chiama Nominatim. Puoi sostituirla col tuo backend quando vuoi. */
async function reverseGeocodeRaw(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
    const res = await fetch(url, {
      headers: { "User-Agent": "AttractionMobile/1.0" },
    });
    const json = await res.json();
    return json?.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

/** Reverse geocode con cache; arrotonda per aumentare hit-rate (~20m). */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = mem.get(key);
  if (cached) return cached;
  const name = await reverseGeocodeRaw(lat, lon);
  mem.set(key, name);
  return name;
}
