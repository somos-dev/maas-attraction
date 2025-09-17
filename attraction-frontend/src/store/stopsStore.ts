import { ENDPOINTS_TRIPS } from "@/routes/api_endpoints";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Import GeoJSON types
import type { FeatureCollection, Point } from "geojson";

interface StopsState {
    stops: [],
    stopsGeoJson: FeatureCollection<Point>,
    loading: boolean,
    lastFetched: number,
    fetchStops: () => Promise<void>
    reset: () => void
}

const STOPS_TTL_MS = 2 * 60 * 1000;

export const useStopsStore = create<StopsState>()(
    persist(
        (set, get) => ({
            stopsGeoJson: { type: "FeatureCollection", features: [] },
            loading: false,
            lastFetched: 0,
            stops: [],
            fetchStops: async () => {
                const { lastFetched } = get();
                const now = Date.now();

                if (now - lastFetched < STOPS_TTL_MS) return;

                set({ loading: true });

                try {
                    const res = await fetch(ENDPOINTS_TRIPS.getAllStops);
                    const data = await res.json();
                    const geoJson = stopsToGeoJSON(data?.stops)
                    console.log("stops", data)
                    console.log("geoJson", geoJson)
                    set({
                        stops:data?.stops ? data.stops : [],
                        stopsGeoJson: geoJson,
                        lastFetched: now,
                        loading: false,
                    });
                } catch (error) {
                    console.error('Error fetching stops:', error);
                    set({ loading: false });
                }
            },
            reset: () => set({
                stops: [],
                stopsGeoJson: { type: "FeatureCollection", features: [] },
                loading: false,
                lastFetched: 0
            })
        }),
        {
            name: "stops-storage-attraction",
            partialize: (state) => ({
                stops: state.stops,
                lastFetched: state.lastFetched
            })
        }
    )
)

const stopsToGeoJSON = (stops: any[]): FeatureCollection<Point> => ({
    type: "FeatureCollection",
    features: stops.map((stop) => ({
        type: "Feature",
        properties: {
            id: stop.id,
            name: stop.name,
        },
        geometry: {
            type: "Point",
            coordinates: [stop.lon, stop.lat],
        },
    })),
});
