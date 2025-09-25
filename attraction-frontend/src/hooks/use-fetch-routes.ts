import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useFetchRoutesStore } from "@/store/fetchRoutesStore";
import { usePanelStore } from "@/store/panelStore";
import { useRoutesStore } from "@/store/routesStore";
import { Route } from "@/app/api/plan-trip/route";
import { useLocationStore } from '@/store/locationStore';
import { useMap } from "@/context/MapContext";

export const useFetchRoutes = () => {
    const { origin, destination} = useLocationStore();
    const { setRoutes, setSelectedRouteIndex } = useRoutesStore();
    const { setPanelOpen } = usePanelStore();
    const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {
        selectedDate,
        selectedTime,
        travelMode,
        travelType,
    } = useFetchRoutesStore();
        const {map} = useMap()


    const fetchRoutes = useCallback(async () => {  
        if (!origin || !destination) {
            toast.error('No routes found for this combination of locations and preferences.');
            return;
        };

        setIsLoadingRoutes(true);
        setError(null);

        const postData = {
            fromLat:  origin.lat,
            fromLon: origin.lon,
            toLat:  destination.lat,
            toLon: destination.lon,
            date:  selectedDate,
            time: selectedTime,
            requested_time: new Date().toTimeString().slice(0, 8),
            requested_date: new Date().toISOString().split('T')[0],
            mode: travelMode,
            travelType: travelType,
        };
        console.log('postdata', postData)

        try {
            const response = await axios.post<{ routes: Route[] }>("/api/plan-trip", postData);
            console.log('response routes',response)
            const routes = response.data.routes?.slice().sort((a, b) => a.duration - b.duration) || [];
            if (routes.length === 0) {
                toast.error('No routes found for this combination of locations and preferences.');
                setRoutes([]);
                setSelectedRouteIndex(-1);
            } else {
                setRoutes(routes);
                setSelectedRouteIndex(0);
                setPanelOpen();
                toast.success(`${routes.length} route(s) found!`);
            }
        } catch (err) {
            setError('Error fetching routes. Please try again.');
            toast.error('Error fetching routes. Please try again.');
            setRoutes([]);
            setSelectedRouteIndex(-1);
        } finally {
            setIsLoadingRoutes(false);
        }
    }, [
        origin, destination, selectedDate, selectedTime, travelMode, travelType,
        setRoutes, setSelectedRouteIndex, setPanelOpen
    ]);

    return { fetchRoutes, isLoadingRoutes, error };
};