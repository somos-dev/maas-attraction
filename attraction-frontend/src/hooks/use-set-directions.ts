import { useCallback } from "react";
import { toast } from "sonner";
import { useFetchRoutesStore } from "@/store/fetchRoutesStore";
import { useLocationStore } from '@/store/locationStore';
import { useMap } from "@/context/MapContext";
import { useCustomSideSheetStore } from "@/store/customSideSheet";
import { useInputStateStore } from "@/store/inputsStateStore";

export const useSetDirections = () => {
  const { setOrigin, setOriginName, setDestination, setDestinationName,setOriginAndDestination } = useLocationStore();
  const { setSelectedDate, setSelectedTime, setTravelMode, setTravelType } = useFetchRoutesStore();
  const { setCurrentContent } = useCustomSideSheetStore();

  const { map } = useMap(); // MapRef and markerRefs  
  const {originInputText, setDestInputText, setOriginInputText, destInputText} = useInputStateStore()

  // Accept a destination object and optional origin, if no origin provided use current location
  let Orglat: number | undefined;
  let Orglon: number | undefined;
  const setDirections = useCallback(
    async ({
      destination,
      origin,
    }: {
      destination: { lat: number; lon: number; name: string };
      origin?: { lat: number; lon: number; name: string };
    }) => {
        if (!map.current) {
          toast.error("Map not loaded. Cannot get current location.");
          return;
        }

    // If origin is provided, use it; otherwise get current location
    if (origin) {
      Orglat = origin.lat;
      Orglon = origin.lon;
      setOriginName(origin.name);
      setOriginInputText(origin.name);
    } else {
      try {
        const position = await getCurrentLocation(); // ⏳ wait here!
        const { latitude, longitude } = position.coords;
        Orglat = latitude;
        Orglon = longitude;

        if (originInputText !== "Current Location") {
          setOriginName("Current Location");
          setOriginInputText("Current Location");
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        toast.error("Failed to get current location. Please enable location services.");
        return; // Stop execution if location fetch fails
      }
    }

    // ✅ Set destination and trigger fetch *after* origin is set
    setOriginAndDestination( { lat: Orglat , lon: Orglon },{ lat: destination.lat, lon: destination.lon });
    setDestinationName(destination.name);
    setDestInputText(destination.name);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTime(new Date().toTimeString().slice(0, 8));
    setTravelMode("all");
    setTravelType("departure");
    setCurrentContent("directions");

    // setShouldFetch(true); // 🟢 Only triggered after origin is set
  
      
    },
    [
      map,
      setDestination,
      setDestinationName,
      setSelectedDate,
      setSelectedTime,
      setTravelMode,
      setTravelType,
      setOrigin,
      setOriginName,
      setCurrentContent
    ]
  );

  return { setDirections };
};


const getCurrentLocation = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};
