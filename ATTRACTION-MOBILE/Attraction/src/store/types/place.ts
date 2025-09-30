// src/store/types/place.ts

// Risorsa Place (luogo preferito)
export interface Place {
  id: number;
  address: string;      // es. "Via Roma, 10, Cosenza"
  type: "home" | "work" | "favorite" | string;
  lat?: number;         // opzionale
  lon?: number;         // opzionale
}

// Request body per creare o modificare un Place
export interface PlaceRequest {
  address: string;
  type: "home" | "work" | "favorite" | string;
  lat?: number;
  lon?: number;
}



