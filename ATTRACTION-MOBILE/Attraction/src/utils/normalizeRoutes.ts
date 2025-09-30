// src/utils/normalizeRoutes.ts
type Coordinates = { lat: number; lon: number };

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

export function normalizeRouteOptionsToRoutes(response: any) {
  const routes: any[] = [];
  const options = response?.options;
  if (!options) return [];

  for (const mode in options) {
    const modeRoutes = options[mode];
    if (Array.isArray(modeRoutes)) {
      modeRoutes.forEach((opt: any, index: number) => {
        const decodedSteps = opt.steps.map((step: any) => {
          const decodedGeometry =
            typeof step.geometry === "string"
              ? decodeRoutePolyline(step.geometry)
              : step.geometry;
          return { ...step, geometry: decodedGeometry };
        });

        routes.push({
          id: `${mode}-${opt.option ?? index}`,
          fromStationName: response.fromStationName,
          toStationName: response.toStationName,
          mode,
          duration: decodedSteps.reduce((sum: number, step: any) => {
            const match = step.duration.match(/(\d+)m/);
            return sum + (match ? parseInt(match[1], 10) : 0);
          }, 0),
          steps: decodedSteps,
        });
      });
    }
  }
  return routes;
}
