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
      console.log("PlanTrip API result:", JSON.stringify(result, null, 2));

      //  passo anche params, così i marker hanno le coordinate
      const normalized = normalizeRouteOptionsToRoutes(result, params);
      setRoutes(normalized);
      return normalized;
    } catch (e) {
      console.error("Errore in fetchTrip:", e);
      setRoutes([]);
      return [];
    }
  }

  return {
    routes,
    loading: isLoading,
    error: isError ? error : null,
    fetchTrip,
  };
}

