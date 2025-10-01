type Coordinates = { lat: number; lon: number };
// Decode polyline Valhalla
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

    coordinates.push({ lat: lat / 1e5, lon: lon / 1e5 }); // ✅ precisione corretta
  }

  return coordinates;
}

/**
 * Normalizza la risposta di plan-trip in un array di rotte
 * @param response risposta del backend
 * @param request  parametri usati per la chiamata (fromLat/fromLon/toLat/toLon)
 */
export function normalizeRouteOptionsToRoutes(response: any, request?: any) {
  const routes: any[] = [];
  const options = response?.options;
  if (!options) return [];

  for (const mode in options) {
    const modeRoutes = options[mode];
    if (Array.isArray(modeRoutes)) {
      modeRoutes.forEach((opt: any, index: number) => {
        // decodifica ogni step
        const decodedSteps = opt.steps.map((step: any, stepIndex: number) => {
          const decodedGeometry =
            typeof step.geometry === "string"
              ? decodeRoutePolyline(step.geometry)
              : step.geometry;

          // Quanti punti arrivano da ogni step
          console.log(
            `[normalizeRoutes] mode=${mode}, step=${stepIndex}, type=${step.type}, punti=${decodedGeometry.length}`
          );

          return { ...step, geometry: decodedGeometry };
        });

        // calcolo durata totale in minuti
        const totalDuration = decodedSteps.reduce((sum: number, step: any) => {
          if (typeof step.duration === "string") {
            const match = step.duration.match(/(\d+)m/);
            return sum + (match ? parseInt(match[1], 10) : 0);
          }
          if (typeof step.duration === "number") {
            return sum + step.duration;
          }
          return sum;
        }, 0);

        routes.push({
          id: `${mode}-${opt.option ?? index}`,
          fromStationName: response.fromStationName ?? response.fromStation,
          toStationName: response.toStationName ?? response.toStation,
          mode,
          duration: totalDuration,
          steps: decodedSteps,
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


