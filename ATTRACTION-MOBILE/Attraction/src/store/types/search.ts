// src/store/types/search.ts

// Request per creare una ricerca
export interface SearchRequest {
  anonymous_session_key?: string; // opzionale, se utente anonimo
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string; // formato: "2025-09-17T10:30:00Z" o "2025-09-17"
  modes: "walk" | "bus" | "bicycle" | "scooter" | "all";
  user?: number; // opzionale, se utente loggato
}

// Risposta del backend (GET o POST)
export interface Search {
  id: number;
  anonymous_session_key?: string | null;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string;
  requested_at: string; // generato dal backend
  modes: string; // il backend può restituire "bus", "walk" ecc. come string
  user?: number | null;
}


