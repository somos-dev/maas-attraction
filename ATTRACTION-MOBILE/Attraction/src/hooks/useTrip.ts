// src/hooks/useTrip.ts
import { useState } from "react";
import { planTripApi } from "../store/api/planTripApi";
import { normalizeRoutes } from "../utils/normalizeRoutes";

/**
 * Hook principale per la pianificazione dei viaggi
 * -------------------------------------------------------
 * - Usa RTK Query per chiamare planTrip
 * - Se non trova risultati, ripete la ricerca
 *   incrementando progressivamente l’orario fino a trovare una soluzione
 */
export function useTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RTK mutation
  const [planTrip] = planTripApi.usePlanTripMutation();

  const fetchTrip = async (params: any) => {
    setLoading(true);
    setError(null);

    try {
      const routes = await searchWithFallback(planTrip, params);
      return routes;
    } catch (err: any) {
      console.error("❌ Errore in fetchTrip:", err);
      setError(err.message || "Errore generico");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { fetchTrip, loading, error };
}

/**
 * Ricerca con fallback orario progressivo
 * --------------------------------------------
 * Se non trova soluzioni all’orario richiesto, ripete la chiamata
 * incrementando l’orario di 30 minuti fino a max 23:59 o 10 tentativi.
 */
async function searchWithFallback(planTrip: any, params: any) {
  const maxAttempts = 10; // fino a 5 ore avanti
  const stepMinutes = 30;
  let attempt = 0;

  let date = params.date;
  let time = params.time;

  while (attempt < maxAttempts) {
    console.log(`🔎 Tentativo ${attempt + 1}: ${date} ${time}`);

    const res: any = await planTrip({
      ...params,
      date,
      time,
      requested_date: date,
      requested_time: time,
    }).unwrap();

    const normalized = normalizeRoutes(res, params);

    //  Se trova almeno una rotta, restituiscila subito
    if (normalized && normalized.length > 0) {
      console.log(`Rotte trovate al tentativo ${attempt + 1}`);
      return normalized;
    }

    // ⏭ Altrimenti incrementa l’orario
    const [h, m] = time.split(":").map((x: string) => parseInt(x, 10));
    const newMinutes = h * 60 + m + stepMinutes;
    if (newMinutes >= 24 * 60) break; // fine giornata

    const nextH = Math.floor(newMinutes / 60);
    const nextM = newMinutes % 60;
    time = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}:00`;

    attempt++;
  }

  console.warn("Nessuna soluzione trovata fino a fine giornata");
  return [];
}



