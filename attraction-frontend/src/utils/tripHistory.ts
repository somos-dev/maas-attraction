import { TripHistoryItem } from '@/redux/services/tripHistoryApi'

/**
 * Get location name using reverse geocoding
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with location name
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  if (lat === 0 && lon === 0) {
    return 'Unknown Location'
  }

  try {
    const response = await fetch(`/api/nominatim/reverse?lat=${lat}&lon=${lon}`)
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    
    const data = await response.json()
    
    // Extract meaningful location name from the response
    if (data.display_name) {
      // Try to get a shorter, more readable name
      const parts = data.display_name.split(',')
      if (parts.length >= 2) {
        return `${parts[0]}, ${parts[1]}`.trim()
      }
      return data.display_name
    }
    
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
  }
}

/**
 * Get readable location string from coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Formatted coordinate string
 */
export const formatLocation = (lat: number, lon: number): string => {
  if (lat === 0 && lon === 0) {
    return 'Unknown Location'
  }
  return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
}

/**
 * Format date to a readable string
 * @param dateString - ISO date string
 * @returns Formatted date
 */
export const formatTripDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  
  return formatTripDate(dateString)
}

/**
 * Group trip history by date
 * @param trips - Array of trip history items
 * @returns Grouped trips by date
 */
export const groupTripsByDate = (trips: TripHistoryItem[]): Record<string, TripHistoryItem[]> => {
  const grouped: Record<string, TripHistoryItem[]> = {}
  
  trips.forEach(trip => {
    const date = new Date(trip.requested_at).toDateString()
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(trip)
  })
  
  return grouped
}

/**
 * Filter trips to show only those from the last week
 * @param trips - Array of trip history items
 * @returns Filtered trips from last week
 */
export const filterLastWeekTrips = (trips: TripHistoryItem[]): TripHistoryItem[] => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return trips.filter(trip => {
    const tripDate = new Date(trip.requested_at)
    return tripDate >= oneWeekAgo
  })
}

/**
 * Calculate distance between two coordinates (approximate)
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
