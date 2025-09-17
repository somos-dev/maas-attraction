import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface CoordinateSet {
  origin?: Coordinate;
  destination?: Coordinate;
}


interface MarkerPositions {
  userLocation?: Coordinate;
  origin?: Coordinate;
  originName?: Coordinate;
  destination?: Coordinate;
  destinationName?: Coordinate;
  SearchLocation?: Coordinate
  SearchLocationName?: Coordinate;
}


interface LocationState {
  origin: Coordinate | null;
  coordinates?: CoordinateSet;
  originName: string;
  destination: Coordinate | null;
  destinationName: string;
  userLocation: Coordinate | null;
  searchLocation: Coordinate | null;
  searchLocationName?: string;
  userLocationName?: string;
  setOrigin: (coord: Coordinate | null) => void;
  setCoordinates: (coords: CoordinateSet) => void;
  setOriginName: (name: string ) => void;
  setDestination: (coord: Coordinate | null) => void;
  setDestinationName: (name: string) => void;
  setSearchLocationName: (name: string) => void;
  setUserLocationName: (name: string) => void;
  setUserLocation: (coord: Coordinate | null) => void;
  setSearchLocation: (coord: Coordinate | null) => void;
  setOriginAndDestination: (
    origin: Coordinate | null,
    destination: Coordinate | null
  ) => void;
  reset: () => void;
}


export const useLocationStore = create(
  persist<LocationState>(
    (set) => ({
      origin: null,
      coordinates: undefined,
      originName: '',
      destination: null,
      destinationName: '',
      userLocation: null,
      searchLocation: null,
      searchLocationName:'',
      userLocationName: '',
      // markerPositions: {},
      setOrigin: (coord) => set({ origin: coord }),
      setCoordinates: (coords) => set({ coordinates: coords }),
      setOriginName: (name) => set({ originName: name }),
      setDestination: (coord) => set({ destination: coord }),
      setDestinationName: (name) => set({ destinationName: name }),
      setSearchLocationName: (name) => set({ searchLocationName: name }),
      setUserLocation: (coord) => set({ userLocation: coord }),
      setSearchLocation: (coord) => set({ searchLocation: coord }),
      setUserLocationName: (name) => set({ userLocationName: name }),
      setOriginAndDestination: (origin, destination) =>
        set((state) => ({ ...state, origin, destination })),
      reset: () => set({ origin: null, destination: null, coordinates: undefined, originName: '', destinationName: '', userLocation: null, searchLocation: null, searchLocationName:''}),
      }),
    {
      name: 'location-storage-attraction',
    }
  )
);
