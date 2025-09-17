// src/store/types/search.ts

export interface Search {
  id: number;
  anonymous_session_key?: string | null; // per utenti anonimi
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  date: string; // formato YYYY-MM-DD
  time: string | "timenow"; // formato HH:MM:SS oppure "timenow"
  mode: "walk" | "bus" | "bicycle" | "scooter" | "all";
  requested_at?: string; // timestamp dal backend
  user?: number | null; // id utente autenticato
}

