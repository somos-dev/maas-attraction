import { create } from 'zustand';

export interface TripHistoryItem {
  id: number;
  anonymous_session_key: string | null;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string;
  requested_at: string;
  modes: string | null;
  user: any | null;
}

interface AdminStore {
  isAdminMode: boolean;
  adminLayers: {
    heatmap: boolean;
    analytics: boolean;
    insights: boolean;
  };
  tripHistory: TripHistoryItem[];
  heatmapData: {
    totalRequests: number;
    topLocations: Array<{
      type: 'origin' | 'destination';
      lat: number;
      lon: number;
      requests: number;
    }>;
    peakHours: Array<{
      hour: number;
      requests: number;
    }>;
    popularRoutes: Array<{
      from: { lat: number; lon: number };
      to: { lat: number; lon: number };
      count: number;
    }>;
  } | null;
  setAdminMode: (mode: boolean) => void;
  toggleAdminMode: () => void;
  toggleAdminLayer: (layer: keyof AdminStore['adminLayers']) => void;
  setTripHistory: (trips: TripHistoryItem[]) => void;
  setHeatmapData: (data: AdminStore['heatmapData']) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAdminMode: false,
  adminLayers: {
    heatmap: true,
    analytics: true,
    insights: true,
  },
  tripHistory: [],
  heatmapData: null,
  
  setAdminMode: (mode) => set({ isAdminMode: mode }),
  
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  
  toggleAdminLayer: (layer) =>
    set((state) => ({
      adminLayers: {
        ...state.adminLayers,
        [layer]: !state.adminLayers[layer],
      },
    })),
  
  setTripHistory: (trips) => set({ tripHistory: trips }),
  
  setHeatmapData: (data) => set({ heatmapData: data }),
}));