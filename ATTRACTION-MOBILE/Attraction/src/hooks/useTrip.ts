// src/hooks/useTrip.ts
import { useState } from "react";
import { usePlanTripMutation } from "../store/api/planTripApi";
import { PlanTripRequest } from "../store/types/planTrip";
import { normalizeRouteOptionsToRoutes } from "../utils/normalizeRoutes";

export function useTrip() {
  const [planTrip, { isLoading, isError, error }] = usePlanTripMutation();
  const [routes, setRoutes] = useState<any[]>([]); // array di rotte normalizzate

  async function fetchTrip(params: PlanTripRequest) {
    try {
      const result = await planTrip(params).unwrap();
      const normalized = normalizeRouteOptionsToRoutes(result);
      setRoutes(normalized);
    } catch (e) {
      console.error("Errore in fetchTrip:", e);
      setRoutes([]); // fallback vuoto in caso di errore
    }
  }

  return {
    routes,              // array già pronto da mostrare in ResultsScreen
    loading: isLoading,  // stato di caricamento
    error: isError ? error : null, // eventuale errore
    fetchTrip,           // funzione per eseguire la ricerca
  };
}

