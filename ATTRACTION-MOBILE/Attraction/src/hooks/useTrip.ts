import { useState } from "react";
import { usePlanTripMutation } from "../store/api/planTripApi";
import { PlanTripRequest } from "../store/types/planTrip";
import { normalizeRouteOptionsToRoutes } from "../utils/normalizeRoutes";

export function useTrip() {
  const [planTrip, { isLoading, isError, error }] = usePlanTripMutation();
  const [routes, setRoutes] = useState<any[]>([]);

  async function fetchTrip(params: PlanTripRequest) {
    try {
      const result = await planTrip(params).unwrap();
      const normalized = normalizeRouteOptionsToRoutes(result);
      setRoutes(normalized);
      return normalized; //  restituisce i risultati
    } catch (e) {
      console.error("Errore in fetchTrip:", e);
      setRoutes([]);
      return []; //  evita undefined
    }
  }

  return {
    routes,
    loading: isLoading,
    error: isError ? error : null,
    fetchTrip,
  };
}
