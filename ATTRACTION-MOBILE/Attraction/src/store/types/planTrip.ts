// src/store/types/planTrip.ts

// Richiesta al backend (POST /plan-trip/)
export interface PlanTripRequest {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  date: string; // formato: "YYYY-MM-DD"
  time: string; // "HH:MM:SS" oppure "timenow"
  mode: "walk" | "bus" | "bicycle" | "scooter" | "all";
  requested_date?: string; // opzionale (backend lo accetta)
  requested_time?: string; // opzionale
}

// Risposta dal backend
export interface PlanTripResponse {
  fromStation: string; // nome fermata più vicina all’origine
  toStation: string;   // nome fermata più vicina alla destinazione
  options: {
    walk: Itinerary[];
    bus: Itinerary[];
    bicycle: Itinerary[];
    scooter: Itinerary[];
    other: Itinerary[];
  };
}

// Singolo itinerario
export interface Itinerary {
  mode: string;
  duration: number;       // minuti
  steps: string[];        // descrizione testuale dei passaggi
}

