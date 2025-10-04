// Request per creare una ricerca
export interface SearchRequest {
  anonymous_session_key?: string | null; // presente se utente anonimo
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string;      // ISO date-time es. "2025-10-02T15:17:20Z"
  requested_at: string;   // ISO date-time (sempre incluso)
  modes: string;          // "all", "ALL", "bus", "BUS", ecc.
  user?: number | null;   // id utente loggato, se presente
}

// Risposta dal backend
export interface Search {
  id: number;
  anonymous_session_key?: string | null;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  trip_date: string;      // ISO date-time
  requested_at: string;   // ISO date-time
  modes: string;
  user?: number | null;
}






