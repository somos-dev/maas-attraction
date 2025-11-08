import { TripHistoryItem } from '@/store/adminStore';

export function tripHistoryToGeoJSON(tripHistory: TripHistoryItem[], type: 'origin' | 'destination' | 'both' = 'both') {
  const features: any[] = [];

  tripHistory.forEach((trip) => {
    // Add origin point
    if (type === 'origin' || type === 'both') {
      features.push({
        type: 'Feature',
        properties: {
          id: trip.id,
          type: 'origin',
          modes: trip.modes,
          trip_date: trip.trip_date,
          requested_at: trip.requested_at,
        },
        geometry: {
          type: 'Point',
          coordinates: [trip.from_lon, trip.from_lat],
        },
      });
    }

    // Add destination point
    if (type === 'destination' || type === 'both') {
      features.push({
        type: 'Feature',
        properties: {
          id: trip.id,
          type: 'destination',
          modes: trip.modes,
          trip_date: trip.trip_date,
          requested_at: trip.requested_at,
        },
        geometry: {
          type: 'Point',
          coordinates: [trip.to_lon, trip.to_lat],
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

// Analytics Calculation Functions
export function calculateTripAnalytics(tripHistory: TripHistoryItem[]) {
  const totalRequests = tripHistory.length;

  // Count occurrences of each location
  const locationCounts = new Map<string, {
    type: 'origin' | 'destination';
    lat: number;
    lon: number;
    count: number;
  }>();

  tripHistory.forEach((trip) => {
    // Origin
    const originKey = `${trip.from_lat.toFixed(4)},${trip.from_lon.toFixed(4)}`;
    const origin = locationCounts.get(originKey);
    if (origin) {
      origin.count++;
    } else {
      locationCounts.set(originKey, {
        type: 'origin',
        lat: trip.from_lat,
        lon: trip.from_lon,
        count: 1,
      });
    }

    // Destination
    const destKey = `${trip.to_lat.toFixed(4)},${trip.to_lon.toFixed(4)}`;
    const dest = locationCounts.get(destKey);
    if (dest) {
      dest.count++;
    } else {
      locationCounts.set(destKey, {
        type: 'destination',
        lat: trip.to_lat,
        lon: trip.to_lon,
        count: 1,
      });
    }
  });

  // Get top locations
  const topLocations = Array.from(locationCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((loc) => ({
      type: loc.type,
      lat: loc.lat,
      lon: loc.lon,
      requests: loc.count,
    }));

  // Calculate peak hours
  const hourCounts = new Map<number, number>();
  tripHistory.forEach((trip) => {
    const hour = new Date(trip.requested_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(hourCounts.entries())
    .map(([hour, requests]) => ({ hour, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);

  // Calculate popular routes (origin-destination pairs)
  const routeCounts = new Map<string, {
    from: { lat: number; lon: number };
    to: { lat: number; lon: number };
    count: number;
  }>();

  tripHistory.forEach((trip) => {
    const routeKey = `${trip.from_lat.toFixed(3)},${trip.from_lon.toFixed(3)}-${trip.to_lat.toFixed(3)},${trip.to_lon.toFixed(3)}`;
    const route = routeCounts.get(routeKey);
    if (route) {
      route.count++;
    } else {
      routeCounts.set(routeKey, {
        from: { lat: trip.from_lat, lon: trip.from_lon },
        to: { lat: trip.to_lat, lon: trip.to_lon },
        count: 1,
      });
    }
  });

  const popularRoutes = Array.from(routeCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRequests,
    topLocations,
    peakHours,
    popularRoutes,
  };
}

// Group trips by date
export function groupTripsByDate(tripHistory: TripHistoryItem[]) {
  const grouped = new Map<string, TripHistoryItem[]>();

  tripHistory.forEach((trip) => {
    const date = trip.trip_date.split('T')[0]; // Get YYYY-MM-DD
    const trips = grouped.get(date) || [];
    trips.push(trip);
    grouped.set(date, trips);
  });

  return Array.from(grouped.entries())
    .map(([date, trips]) => ({
      date,
      count: trips.length,
      trips,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}


// Filter trip history by date range
export function filterTripsByDateRange(
  tripHistory: TripHistoryItem[],
  startDate: string,
  endDate: string
) {
  return tripHistory.filter((trip) => {
    const tripDate = trip.trip_date.split('T')[0];
    return tripDate >= startDate && tripDate <= endDate;
  });
}

// Get most popular transport modes
export function getModeStatistics(tripHistory: TripHistoryItem[]) {
  const modeCounts = new Map<string, number>();

  tripHistory.forEach((trip) => {
    if (trip.modes) {
      const modes = trip.modes.split(',');
      modes.forEach((mode) => {
        const trimmedMode = mode.trim();
        modeCounts.set(trimmedMode, (modeCounts.get(trimmedMode) || 0) + 1);
      });
    }
  });

  return Array.from(modeCounts.entries())
    .map(([mode, count]) => ({ mode, count }))
    .sort((a, b) => b.count - a.count);
}