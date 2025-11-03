import React, { useState, useEffect } from 'react'
import { useGetTripHistoryQuery, useDeleteTripHistoryItemMutation } from '@/redux/services/tripHistoryApi'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Skeleton } from '../../ui/skeleton'
import { 
  reverseGeocode,
  formatTripDate, 
  getRelativeTime, 
  groupTripsByDate,
  filterLastWeekTrips,
  calculateDistance 
} from '@/utils/tripHistory'
import { useSetDirections } from '@/hooks/use-set-directions'
import { MapPin, Clock, Route, ChevronDown, ChevronUp, Navigation, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {}

// Trip History Component - Shows search history from the last week

interface LocationName {
  [key: string]: string // key is "lat,lon", value is the location name
}

const TripHistoryContent = (props: Props) => {
  const { data: tripHistory, isLoading, error, refetch } = useGetTripHistoryQuery()
  const [deleteTripHistoryItem] = useDeleteTripHistoryItemMutation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [locationNames, setLocationNames] = useState<LocationName>({})
  const [loadingLocations, setLoadingLocations] = useState<Set<string>>(new Set())
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set())
  const { setDirections } = useSetDirections()

  const toggleGroup = (date: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedGroups(newExpanded)
  }

  // Function to get location name with caching
  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    const key = `${lat},${lon}`
    
    if (locationNames[key]) {
      return locationNames[key]
    }

    if (loadingLocations.has(key)) {
      return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
    }

    setLoadingLocations(prev => new Set(prev).add(key))
    
    try {
      const name = await reverseGeocode(lat, lon)
      setLocationNames(prev => ({ ...prev, [key]: name }))
      return name
    } catch (error) {
      console.error('Failed to get location name:', error)
      return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
    } finally {
      setLoadingLocations(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  // Load location names for visible trips
  useEffect(() => {
    if (!tripHistory) return
    console.log(tripHistory)
    const lastWeekTrips = filterLastWeekTrips(tripHistory)
    const groupedTrips = groupTripsByDate(lastWeekTrips)
    
    // Load location names for expanded groups
    Object.entries(groupedTrips).forEach(([date, trips]) => {
      if (expandedGroups.has(date)) {
        trips.forEach(trip => {
          // Load both from and to locations
          getLocationName(trip.from_lat, trip.from_lon)
          getLocationName(trip.to_lat, trip.to_lon)
        })
      }
    })
  }, [tripHistory, expandedGroups])

  const handleGetDirections = (trip: any) => {
    const fromKey = `${trip.from_lat},${trip.from_lon}`
    const toKey = `${trip.to_lat},${trip.to_lon}`
    const fromName = locationNames[fromKey] || `${trip.from_lat.toFixed(4)}°, ${trip.from_lon.toFixed(4)}°`
    const toName = locationNames[toKey] || `${trip.to_lat.toFixed(4)}°, ${trip.to_lon.toFixed(4)}°`

    setDirections({
      origin: {
        lat: trip.from_lat,
        lon: trip.from_lon,
        name: fromName
      },
      destination: {
        lat: trip.to_lat,
        lon: trip.to_lon,
        name: toName
      }
    })
  }

  const handleDeleteTrip = async (tripId: number, event: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering card click
    event.stopPropagation()
    
    setDeletingItems(prev => new Set(prev).add(tripId))
    
    try {
      await deleteTripHistoryItem(tripId).unwrap()
      toast.success('Trip history item deleted successfully')
    } catch (error) {
      console.error('Failed to delete trip history item:', error)
      toast.error('Failed to delete trip history item')
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(tripId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trip Search History</h2>
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <MapPin className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Unable to load trip history</h3>
            <p className="text-gray-500 mb-4">There was an error fetching your search history.</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tripHistory || tripHistory.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Trip Search History</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-400 mb-4">
              <Route className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No search history yet</h3>
            <p className="text-gray-500">Your trip searches will appear here once you start planning routes.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter trips to show only last week
  const lastWeekTrips = filterLastWeekTrips(tripHistory)

  if (lastWeekTrips.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Trip Search History</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No recent searches</h3>
            <p className="text-gray-500">No trip searches found in the last week. Your recent searches will appear here.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group trips by date
  const groupedTrips = groupTripsByDate(lastWeekTrips)
  const sortedDates = Object.keys(groupedTrips).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trip Search History</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {lastWeekTrips.length} searches (last week)
          </Badge>
        </div>
      </div>

      {/* Trip History Groups */}
      <div className="space-y-3">
        {sortedDates.map(date => {
          const dateTrips = groupedTrips[date]
          const isExpanded = expandedGroups.has(date)
          const displayDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          return (
            <div key={date}>
              {/* Date Header */}
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto"
                onClick={() => toggleGroup(date)}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{displayDate}</span>
                  <Badge variant="secondary" className="text-xs">
                    {dateTrips.length}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {/* Trip Cards */}
              {isExpanded && (
                <div className="space-y-2 ml-4">
                  {dateTrips.map(trip => {
                    const distance = calculateDistance(
                      trip.from_lat, 
                      trip.from_lon, 
                      trip.to_lat, 
                      trip.to_lon
                    )

                    const fromKey = `${trip.from_lat},${trip.from_lon}`
                    const toKey = `${trip.to_lat},${trip.to_lon}`
                    const fromName = locationNames[fromKey] || `${trip.from_lat.toFixed(4)}°, ${trip.from_lon.toFixed(4)}°`
                    const toName = locationNames[toKey] || `${trip.to_lat.toFixed(4)}°, ${trip.to_lon.toFixed(4)}°`

                    return (
                      <Card key={trip.id} className="hover:shadow-sm transition-shadow relative">
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 z-10"
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          disabled={deletingItems.has(trip.id)}
                        >
                          {deletingItems.has(trip.id) ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-red-500 border-t-transparent" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                        
                        <CardContent className="p-4 pb-0">
                          <div className="space-y-3">
                            {/* Route Info */}
                            <div className="flex items-start justify-between space-x-1">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 flex-shrink-0 text-green-500" />
                                  <span className="font-medium">From:</span>
                                  <span className="text-gray-600 min-w-0 break-words">
                                    {loadingLocations.has(fromKey) ? 'Loading...' : fromName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
                                  <span className="font-medium">To:</span>
                                  <span className="text-gray-600 min-w-0 break-words">
                                    {loadingLocations.has(toKey) ? 'Loading...' : toName}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div>{getRelativeTime(trip.requested_at)}</div>
                                {distance > 0 && (
                                  <div className="mt-1">
                                    ~{distance.toFixed(1)} km
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Trip Details and Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t gap-2">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Trip: {formatTripDate(trip.trip_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {trip.modes && (
                                  <Badge variant="outline" className="text-xs">
                                    {trip.modes}
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGetDirections(trip)}
                                  className="h-7 text-xs"
                                  disabled={trip.to_lat === 0 && trip.to_lon === 0}
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  Directions
                                </Button>
                                <div className="text-xs text-gray-400">
                                  #{trip.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TripHistoryContent