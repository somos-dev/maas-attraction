import { Route } from "@/app/api/plan-trip/route";
import { create } from "zustand";

export interface Trip {
  id: string;
  origin: [number, number];
  destination: [number, number];
  originName: string;
  destinationName: string;
  selectedRoute: Route | null;
  date: string;
  time: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

interface TripStore {
    currentTrip:Trip | null,
    isTripManagerOpen:boolean,
    setCurrentTrip:(trip:Trip)=>void
    setTripManagerOpen:()=>void
    setTripManagerClose:()=>void
    toggleTripManager: () => void;
}

export const useTripManagerStore = create<TripStore>((set)=>({
    currentTrip:null,
    isTripManagerOpen:false,
    setCurrentTrip:(trip)=>set({currentTrip:trip}),
    setTripManagerOpen: ()=>set({isTripManagerOpen:true}),
    setTripManagerClose: ()=>set({isTripManagerOpen:false}),
    toggleTripManager: ()=>set((state)=>({isTripManagerOpen:!state.isTripManagerOpen})),
}))