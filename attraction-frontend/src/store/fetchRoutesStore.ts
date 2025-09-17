import { Route } from '@/app/api/plan-trip/route';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface FetchRoutesStore {
  selectedDate: string;
  selectedTime: string;
  travelType: 'departure' | 'arrival';
  travelMode: 'all' | 'walk' | 'bus' | 'bicycle' | 'scooter' | 'other';
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setTravelType: (type: 'departure' | 'arrival') => void;
  setTravelMode: (mode: 'all' | 'walk' | 'bus' | 'bicycle' | 'scooter' | 'other') => void;
}


export const useFetchRoutesStore = create<FetchRoutesStore>((set) => ({
      selectedDate: new Date().toISOString().split('T')[0],
      selectedTime: new Date().toTimeString().slice(0, 8),
      travelType: 'departure',
      travelMode: 'all',
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTime: (time) => set({ selectedTime: time }),
      setTravelType: (type) => set({ travelType: type }),
      setTravelMode: (mode) => set({ travelMode: mode }),
}
));
