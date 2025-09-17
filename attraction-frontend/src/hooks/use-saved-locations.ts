import { useGetLocationsQuery, selectLocationTypes, type Location } from "@/redux/services/savedApi";
import { useMemo } from "react";

export interface LocationTypeGroup {
  type: string;
  count: number;
  locations: Location[];
  config: {
    icon: string;
    color: string;
    description: string;
  };
}

/**
 * Custom hook for efficiently managing saved locations
 * Provides optimized selectors and computed state
 */
export const useSavedLocations = () => {
  const {
    data: locations = [],
    isLoading,
    isError,
    error,
    isSuccess,
    refetch
  } = useGetLocationsQuery();

  // Memoized location groups to prevent unnecessary re-renders
  const locationGroups = useMemo(() => {
    return selectLocationTypes(locations);
  }, [locations]);

  // Memoized location by type selector
  const getLocationsByType = useMemo(() => {
    return (type: string) => locations.filter(location => location.type === type);
  }, [locations]);

  // Memoized location by id selector
  const getLocationById = useMemo(() => {
    return (id: number) => locations.find(location => location.id === id);
  }, [locations]);

  // Statistics
  const stats = useMemo(() => ({
    totalLocations: locations.length,
    totalTypes: locationGroups.length,
    mostPopularType: locationGroups.reduce((max, group) => 
      group.count > (max?.count || 0) ? group : max, null as LocationTypeGroup | null
    ),
    typeDistribution: locationGroups.map(group => ({
      type: group.type,
      count: group.count,
      percentage: Math.round((group.count / locations.length) * 100) || 0
    }))
  }), [locations.length, locationGroups]);

  return {
    // Data
    locations,
    locationGroups,
    stats,
    
    // Selectors
    getLocationsByType,
    getLocationById,
    
    // Query state
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
    
    // Utilities
    hasLocations: locations.length > 0,
    isEmpty: locations.length === 0,
  };
};

/**
 * Hook for location type management
 * Provides utilities for working with location types
 */
export const useLocationTypes = () => {
  const { locationGroups } = useSavedLocations();

  const getTypeConfig = (type: string) => {
    const group = locationGroups.find(g => g.type === type);
    return group?.config || {
      icon: 'MapPin',
      color: 'text-gray-500',
      description: 'Other locations'
    };
  };

  const typeExists = (type: string) => {
    return locationGroups.some(group => group.type === type);
  };

  const getTypeCount = (type: string) => {
    const group = locationGroups.find(g => g.type === type);
    return group?.count || 0;
  };

  return {
    locationGroups,
    getTypeConfig,
    typeExists,
    getTypeCount,
    availableTypes: locationGroups.map(g => g.type),
  };
};
