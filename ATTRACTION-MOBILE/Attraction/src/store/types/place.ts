export interface Place {
  id: number;
  address: string;
  type: "home" | "work" | "favorite" | string; // vincoliamo i principali
  lat?: number;
  lon?: number;
}

