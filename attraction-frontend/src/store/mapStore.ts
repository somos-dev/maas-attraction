import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface MapViewState {
    center: [number, number]; // [lon, lat]
    zoom: number;
    pitch: number;
    bearing: number;
}


interface MapState {
    is3D: boolean;
    mapStyle: string;
    mapView: MapViewState;
    toggle3D: () => void;
    setMapStyle: (style:string)=>void;
    setMapView: (view: MapViewState) => void;
    reset: () => void;
}

// persist<MapState>( (set) => ({ state + actions }), options )
export const useMapStore = create(
  persist<MapState>(
    (set, get) => ({
      is3D: false,
      mapView: {
        center: [16.3330556, 39.5966853],
        zoom: 12,
        pitch: 0,
        bearing: 0,
      },
      mapStyle: 'streets',
      setMapStyle: (style) => set({ mapStyle: style }),
      toggle3D: () => set((state) => ({ is3D: !state.is3D })),
      setMapView: (view) => set({ mapView: view }),
      reset: () => set({
        is3D: false,
        mapView: {
          center: [16.3330556, 39.5966853],
          zoom: 12,
          pitch: 0,
          bearing: 0,
        },
        mapStyle: 'streets',  
      }),
    }),
    {
      name: 'map-storage-attraction',
      // merge: (persistedState, currentState) => ({ ...currentState, ...persistedState }),
    }
  )
);
