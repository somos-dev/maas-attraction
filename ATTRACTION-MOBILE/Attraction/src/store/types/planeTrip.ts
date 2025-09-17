// src/store/types/planTrip.ts

// POST /plan-trip/
export interface PlanTripRequest {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM:SS" oppure "timenow"
  mode: "walk" | "bus" | "bicycle" | "scooter" | "all";
}

// Risposta dal backend
export interface PlanTripResponse {
  fromStation: string;
  toStation: string;
  itineraries: {
    mode: string;
    duration: number;
    steps: string[];
  }[];
}
