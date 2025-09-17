// /app/api/route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination } = body;

    const valhallaUrl = "https://valhalla1.openstreetmap.de/route"; // Your Valhalla instance

    const valhallaResponse = await fetch(valhallaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [
          { lat: origin.lat, lon: origin.lon },
          { lat: destination.lat, lon: destination.lon }
        ],
        costing: 'auto',
        directions_options: { units: 'kilometers' },
      }),
    });

    const valhallaData = await valhallaResponse.json();
    const encoded = valhallaData.trip.legs[0].shape;

    // Decode polyline to coordinates
    const coordinates = decodeValhallaPolyline(encoded);

    return NextResponse.json({ coordinates });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

// Decode Valhalla polyline
function decodeValhallaPolyline(encoded: string): { lat: number; lon: number }[] {
  let index = 0, lat = 0, lon = 0;
  const coordinates = [];

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

    coordinates.push({ lat: lat / 1e6, lon: lon / 1e6 });
  }
  return coordinates;
}
