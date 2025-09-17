import { Route } from '@/app/api/plan-trip/route';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface Routestate {
  routes: Route[] | [];
  selectedRouteIndex: number;
  setRoutes: (routes: Route[] | []) => void;
  setSelectedRouteIndex: (idx: number) => void;
  reset: () => void;
}


export const useRoutesStore = create(
  persist<Routestate>(
    (set) => ({
      routes: [],
      selectedRouteIndex: 0,
      setRoutes: (routes) => set({ routes: routes }),
      setSelectedRouteIndex: (idx) => set({ selectedRouteIndex: idx }),
      reset: () => set({ routes: [], selectedRouteIndex: 0 }),
    }),
    {
      name: 'routes-storage-attraction',
    }
  )
);
