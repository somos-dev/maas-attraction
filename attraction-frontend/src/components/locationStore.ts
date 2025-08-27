import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coordinate {
  lat: number;
  lon: number;
}


interface MarkerPositions {
  origin?: Coordinate;
  destination?: Coordinate;
  userLocation?: Coordinate;
  SearchLocation?: Coordinate
}


interface LocationState {
  origin: Coordinate | null;
  destination: Coordinate | null;
  userLocation: Coordinate | null;
  searchLocation: Coordinate | null;
  // markerPositions: MarkerPositions
  setOrigin: (coord: Coordinate | null) => void;
  setDestination: (coord: Coordinate | null) => void;
  setUserLocation: (coord: Coordinate | null) => void;
  setSearchLocation: (coord: Coordinate | null) => void;
}


export const useLocationStore = create(
  persist<LocationState>(
    (set) => ({
      origin: null,
      destination: null,
      userLocation: null,
      searchLocation: null,
      // markerPositions: {},
      setOrigin: (coord) => set({ origin: coord }),
      setDestination: (coord) => set({ destination: coord }),
      setUserLocation: (coord) => set({ userLocation: coord }),
      setSearchLocation: (coord) => set({ searchLocation: coord }),
    }),
    {
      name: 'location-storage',
    }
  )
);
