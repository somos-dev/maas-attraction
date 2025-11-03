import { ENDPOINTS_TRIPS } from '@/routes/api_endpoints';
import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/utils/axios';


export type Coordinates = {
  lat: number;
  lon: number;
};

export type Legs = {
  type: string;
  from: string;
  to: string;
  duration: string;
  duration_s: string;
  start_time: string;
  end_time: string;
  geometry: string | Coordinates[];
  distance_m:number;
  walk_steps:[];
  route?: string;
  authority_name?: string;
  authority_id?: string;
  bus_name?: string;
};

export type Segments = {
  mode: string;
  from: string;
  to: string;
  distance_m: number;
  duration_s: number;
  legs_count: number
}

export type Option = {
  option: number;
  total_distance_m:number;
  walk_distance_m:number;
  legs: Legs[];
  segments?: Segments[];
};

export type OptionsMap = {
  walk: Option[];
  bus: Option[];
  bicycle: Option[];
  scooter: Option[];
  other: Option[];
};

export type TransportMode = keyof OptionsMap;

export type RouteResponse = {
  fromStationName: string;
  toStationName: string;
  options: OptionsMap;
};

export type Route = {
  id: string;
  fromStationName: string;
  toStationName: string;
  mode: TransportMode;
  totalDuration: number;
  totalDistance: number;
  walkDistance: number;
  steps: Legs[];
  segments?: Segments[];
};




export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromLat, fromLon, toLat, toLon, date, mode, time, requested_time, requested_date } = body;

    const response = await axiosInstance.post<RouteResponse>(ENDPOINTS_TRIPS.planTrip, {
      fromLat,
      fromLon,
      toLat,
      toLon,
      date,
      time,
      requested_date,
      requested_time,
      mode,
    });

    const routeResponse = response.data;


    console.log("original response", routeResponse)
    const options: OptionsMap = routeResponse.options

    const routes = normalizeRouteOptionsToRoutes(routeResponse);

    return NextResponse.json({ routes });
  } catch (e) {
    // console.error(e);
    console.log("error in api:", e)
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

// Decode Valhalla polyline
function decodeRoutePolyline(encoded: string): Coordinates[] {
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

    coordinates.push({ lat: lat / 1e5, lon: lon / 1e5 }); // ✅ Correct precision
  }

  return coordinates;
}


function haversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aHarv =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return R * c; // in kilometers
}


function normalizeRouteOptionsToRoutes(response: RouteResponse): Route[] | undefined {
  const routes: Route[] = [];
  const options = response?.options
  console.log(response.fromStationName, response.toStationName)
  if (!options) return
  for (const mode in options) {
    const modeRoutes = options[mode as TransportMode];

    if (Array.isArray(modeRoutes)) {
      modeRoutes.forEach((opt, index) => {
        const decodedLegs = opt.legs.map((leg) => {
          const decodedGeometry = typeof leg.geometry === 'string'
            ? decodeRoutePolyline(leg.geometry)
            : leg.geometry;

          return {
            ...leg,
            geometry: decodedGeometry,
          };
        });

        // const totalDuration = decodedLegs.reduce((sum, leg) => {
        //   const match = leg.duration.match(/(\d+)m/);
        //   return sum + (match ? parseInt(match[1], 10) : 0);
        // }, 0);

        // const totalDistance = decodedLegs.reduce((sum, leg) => {
        //   const coords = leg.geometry as Coordinates[];
        //   let legDistance = 0;

        //   for (let i = 1; i < coords.length; i++) {
        //     legDistance += haversineDistance(coords[i - 1], coords[i]);
        //   }

        //   return sum + legDistance;
        // }, 0);

        // routes.push({
        //   id: `${mode}-${opt.option ?? index}`,
        //   fromStationName: response.fromStationName,
        //   toStationName: response.toStationName,
        //   mode: mode as TransportMode,
        //   duration: totalDuration,
        //   distance: parseFloat(totalDistance.toFixed(2)), // km, rounded
        //   steps: decodedLegs,
        // });
        routes.push({
          id: `${mode}-${opt.option ?? index}`,
          fromStationName: response.fromStationName,
          toStationName: response.toStationName,
          mode: mode as TransportMode,
          walkDistance: opt.walk_distance_m,
          totalDistance: opt.total_distance_m,
          totalDuration: opt.legs.reduce((sum, leg) => sum + parseInt(leg.duration_s), 0),
          steps: decodedLegs,
          segments: opt.segments
        });
      });
    }
  }

  return routes;
}

