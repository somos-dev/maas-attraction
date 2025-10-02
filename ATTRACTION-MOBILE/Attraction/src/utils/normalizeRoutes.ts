// src/utils/normalizeRoutes.ts
type Coordinates = { lat: number; lon: number };

// Decode polyline OTP/Valhalla
export function decodeRoutePolyline(encoded: string): Coordinates[] {
  let index = 0, lat = 0, lon = 0;
  const coordinates: Coordinates[] = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlon = (result & 1) ? ~(result >> 1) : (result >> 1);
    lon += dlon;

    coordinates.push({ lat: lat / 1e5, lon: lon / 1e5 });
  }

  return coordinates;
}

/**
 * Normalizza la risposta di plan-trip in un array di rotte
 */
export function normalizeRoutes(response: any, request?: any) {
  const routes: any[] = [];
  const options = response?.options;
  if (!options) return [];

  for (const mode in options) {
    const modeRoutes = options[mode];
    if (Array.isArray(modeRoutes)) {
      modeRoutes.forEach((opt: any, index: number) => {
        // ✅ usa legs invece di steps
        const decodedLegs = (opt.legs || []).map((leg: any, legIndex: number) => {
          const decodedGeometry =
            typeof leg.geometry === "string"
              ? decodeRoutePolyline(leg.geometry)
              : leg.geometry || [];

          return { ...leg, geometry: decodedGeometry };
        });

        // durata totale in minuti
        const totalDuration = decodedLegs.reduce((sum: number, leg: any) => {
          if (typeof leg.duration_s === "number") {
            return sum + Math.round(leg.duration_s / 60);
          }
          return sum;
        }, 0);

        // distanza totale in km
        const totalDistanceKm = (opt.total_distance_m || 0) / 1000;

        routes.push({
          id: `${mode}-${opt.option ?? index}`,
          fromStationName: response.fromStationName,
          toStationName: response.toStationName,
          mode,
          duration: totalDuration,
          distance: Math.round(totalDistanceKm * 10) / 10,
          legs: decodedLegs,            // 👈 per MapView
          segments: opt.segments || [], // 👈 info aggregate
          fromLat: request?.fromLat,
          fromLon: request?.fromLon,
          toLat: request?.toLat,
          toLon: request?.toLon,
        });
      });
    }
  }

  return routes;
}
