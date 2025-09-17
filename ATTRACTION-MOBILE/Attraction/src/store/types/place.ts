// src/store/types/place.ts

export interface Place {
  id: number;
  address: string;
  type: string; // es: "home", "work", "favorite", ma può essere libero
}

// Request body per creare o modificare un Place
export interface PlaceRequest {
  address: string;
  type: string;
}


