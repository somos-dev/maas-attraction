import { ENDPOINTS_TRIPS } from '@/routes/api_endpoints';
import { NextRequest, NextResponse } from 'next/server';
import polyline from '@mapbox/polyline';
import axios from 'axios';
import axiosInstance from '@/utils/axios';


type Coordinates = {
  lat: number;
  lon: number;
};

type Step = {
  type: string;
  from: string;
  to: string;
  duration: string;
  start_time: string;
  end_time: string;
  geometry: string | Coordinates[];
  route?: string;
};

type Option = {
  option: number;
  steps: Step[];
};

type OptionsMap = {
  walk: Option[];
  bus: Option[];
  bicycle: Option[];
  scooter: Option[];
  other: Option[];
};

type TransportMode = keyof OptionsMap;

export type Route = {
  id: string;
  fromStationName: string;
  toStationName: string;
  mode: TransportMode;
  duration: number;
  distance: number;
  steps: Step[];
};

export type RouteResponse = {
  fromStationName: string;
  toStationName: string;
  options: OptionsMap;
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
    console.log("error:", e)
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
        const decodedSteps = opt.steps.map((step) => {
          const decodedGeometry = typeof step.geometry === 'string'
            ? decodeRoutePolyline(step.geometry)
            : step.geometry;

          return {
            ...step,
            geometry: decodedGeometry,
          };
        });

        const totalDuration = decodedSteps.reduce((sum, step) => {
          const match = step.duration.match(/(\d+)m/);
          return sum + (match ? parseInt(match[1], 10) : 0);
        }, 0);

        const totalDistance = decodedSteps.reduce((sum, step) => {
          const coords = step.geometry as Coordinates[];
          let stepDistance = 0;

          for (let i = 1; i < coords.length; i++) {
            stepDistance += haversineDistance(coords[i - 1], coords[i]);
          }

          return sum + stepDistance;
        }, 0);

        routes.push({
          id: `${mode}-${opt.option ?? index}`,
          fromStationName: response.fromStationName,
          toStationName: response.toStationName,
          mode: mode as TransportMode,
          duration: totalDuration,
          distance: parseFloat(totalDistance.toFixed(2)), // km, rounded
          steps: decodedSteps,
        });
      });
    }
  }

  return routes;
}
