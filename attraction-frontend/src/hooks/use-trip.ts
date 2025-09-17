import { useLocationStore } from '@/store/locationStore';
import { useRoutesStore } from '@/store/routesStore';
import { useTripManagerStore } from '@/store/tripStore';
import React from 'react'

type Props = {}

const useTripUtils = () => {
    const {currentTrip,setCurrentTrip} = useTripManagerStore()
    const {origin, destination} = useLocationStore();
    const {routes,setRoutes,selectedRouteIndex,setSelectedRouteIndex} = useRoutesStore();

    const handleStartTrip = () => {
    if (currentTrip) {
      setCurrentTrip({
        ...currentTrip,
        status: 'active'
      });
    }
  };

  const handleCancelTrip = () => {
    if (currentTrip) {
      setCurrentTrip({
        ...currentTrip,
        status: 'cancelled'
      });
    }
  };

  const handleRerouteTrip = () => {
    if (currentTrip && origin && destination) {
    //   const newRoutes = generateMockRoutes(origin, destination);
    //   setRoutes(newRoutes);
      setSelectedRouteIndex(0);
      setCurrentTrip({
        ...currentTrip,
        selectedRoute: routes[0] || null
      });
    }
  };



  return {
    handleStartTrip,
    handleCancelTrip,
    handleRerouteTrip
  }
}

export default useTripUtils