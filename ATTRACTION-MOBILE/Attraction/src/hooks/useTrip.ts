import { useState } from "react";
import { planTripApi } from "../store/api/planTripApi";
import { normalizeRoutes } from "../utils/normalizeRoutes";

export function useTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RTK mutation
  const [planTrip] = planTripApi.usePlanTripMutation();

  const fetchTrip = async (params: any) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await planTrip(params).unwrap();
      console.log("PlanTrip API result:", res);

      // ✅ Normalizza qui, non altrove
      const normalized = normalizeRoutes(res, params);
      console.log("Normalized routes in useTrip:", normalized);

      return normalized; // 👈 già array di rotte
    } catch (err: any) {
      console.error("Errore in fetchTrip:", err);
      setError(err.message || "Errore generico");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { fetchTrip, loading, error };
}


