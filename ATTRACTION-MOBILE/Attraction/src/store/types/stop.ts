// src/store/types/stop.ts

export interface Stop {
  id: string;         // stop_id
  name: string;       // nome della fermata
  lat: number;
  lon: number;
  
}

export interface StopSchedule {
  stop_id: string;
  arrivals: {
    line: string;
    time: string;
  }[];
}
