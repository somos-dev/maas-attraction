import { useEffect, useState } from "react";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";
import { PermissionsAndroid, Platform } from "react-native";

export interface Location {
  lat: number;
  lon: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestPermission() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Permesso posizione",
            message: "L'app ha bisogno dell'accesso alla posizione per calcolare i percorsi",
            buttonNeutral: "Chiedi dopo",
            buttonNegative: "Annulla",
            buttonPositive: "Ok",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS gestisce da Info.plist
  }

  async function fetchLocation() {
    setLoading(true);
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError("Permesso posizione negato");
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (pos: GeoPosition) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  // opzionale: recupera subito la posizione al mount
  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, error, loading, fetchLocation };
}
