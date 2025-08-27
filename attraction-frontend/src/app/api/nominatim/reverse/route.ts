import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const format = searchParams.get('format') || 'jsonv2';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude parameters are required' }, { status: 400 });
  }

  // Validate coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    console.log('Invalid latitude or longitude values:', lat, lon);
    return NextResponse.json({ error: 'Invalid latitude or longitude values' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=${format}&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MaaS-Attraction-App/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reverse Nominatim search results:', data);
    // Return the data with proper caching headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Nominatim reverse error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reverse geocoding results' },
      { status: 500 }
    );
  }
}
