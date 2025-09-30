// src/store/types/search.ts

// Request per creare una ricerca
export interface SearchRequest {
  anonymous_session_key?: string; // opzionale (utenti anonimi)
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string; // es. "2025-09-17" o "2025-09-17T10:30:00Z"
  modes: "walk" | "bus" | "bicycle" | "scooter" | "all";
  user?: number; // opzionale (utenti loggati)
}

// Risposta dal backend (GET o POST)
export interface Search {
  id: number;
  anonymous_session_key?: string | null;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string;     // data richiesta
  requested_at: string;  // timestamp generato dal backend
  modes: string;         // backend può restituire "BUS", "WALK" ecc.
  user?: number | null;
}



