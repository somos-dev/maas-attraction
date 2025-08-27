'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Square, RotateCcw, Trash2, Navigation, Clock } from 'lucide-react';
import { useTripManagerStore } from '@/store/tripStore';
import useTripUtils from '@/hooks/use-trip';


interface Trip {
  id: string;
  origin: [number, number];
  destination: [number, number];
  originName: string;
  destinationName: string;
  selectedRoute: any;
  date: string;
  time: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

interface TripManagerProps {
}

const TripManager: React.FC<TripManagerProps> = ({
}) => {

const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
const {currentTrip} = useTripManagerStore()
const  { handleCancelTrip, handleRerouteTrip, handleStartTrip } = useTripUtils()


  useEffect(() => {
    // Load saved trips from localStorage
    const saved = localStorage.getItem('savedTrips');
    if (saved) {
      setSavedTrips(JSON.parse(saved));
    }
  }, []);

  const saveTrip = (trip: Trip) => {
    const updatedTrips = [...savedTrips, trip];
    setSavedTrips(updatedTrips);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
  };

  const deleteTrip = (tripId: string) => {
    const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
    setSavedTrips(updatedTrips);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const formatDistance = (km: number) => {
    return km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentTrip) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Trip History</h3>
        {savedTrips.length === 0 ? (
          <p className="text-gray-500">No saved trips yet</p>
        ) : (
          <div className="space-y-2">
            {savedTrips.slice(-5).reverse().map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{trip.originName} → {trip.destinationName}</div>
                  <div className="text-xs text-gray-500">{trip.date} at {trip.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => deleteTrip(trip.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Current Trip</h3>
        <Badge className={getStatusColor(currentTrip.status)}>
          {currentTrip.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4" />
            <span className="font-medium">{currentTrip.originName}</span>
          </div>
          <div className="ml-6 text-xs text-gray-500">to {currentTrip.destinationName}</div>
        </div>

        {currentTrip.selectedRoute && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(currentTrip.selectedRoute.duration)}
            </div>
            <div>{formatDistance(currentTrip.selectedRoute.distance)}</div>
            <Badge variant="outline" className="capitalize">
              {currentTrip.selectedRoute.mode}
            </Badge>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          {currentTrip.status === 'planned' && (
            <>
              <Button onClick={handleStartTrip} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Trip
              </Button>
              <Button variant="outline" onClick={() => saveTrip(currentTrip)}>
                Save
              </Button>
            </>
          )}

          {currentTrip.status === 'active' && (
            <>
              <Button variant="destructive" onClick={handleCancelTrip}>
                <Square className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={handleRerouteTrip}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reroute
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TripManager;
