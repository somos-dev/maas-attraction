import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

import StopMarker from "./StopMarker";
import Marker from "./Marker";
import { useGetSearchesQuery } from "../../store/api/searchApi";

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  route?: any; // percorso selezionato dalla ResultsScreen
}

export default function MapView({ route }: MapViewProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const { data: searches = [] } = useGetSearchesQuery();

  // chiedi permessi + ottieni posizione
  useEffect(() => {
    const requestLocation = async () => {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            setLocation([longitude, latitude]); // [lon, lat]
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    };
    requestLocation();
  }, []);

  return (
    <MapLibreGL.MapView style={styles.map}>
      {/* Raster OSM */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"]}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
      </MapLibreGL.RasterSource>

      {/* Camera centrata su rotta o posizione */}
      <MapLibreGL.Camera
        zoomLevel={14}
        centerCoordinate={
          route
            ? [
                route.steps[0].geometry[0].lon,
                route.steps[0].geometry[0].lat,
              ]
            : location || [16.22727, 39.35589] // fallback Arcavacata
        }
      />

      {/* Marker posizione utente */}
      {location && (
        <Marker
          id="user-location"
          coordinate={location}
          color="#2196F3" // blu per distinguere l'utente
        />
      )}

      {/* Marker origine/destinazione da API /search/ */}
      {searches.map((s) => (
        <React.Fragment key={s.id}>
          <StopMarker
            id={`from-${s.id}`}
            coordinate={[s.from_lon, s.from_lat]}
            title="Origine"
          />
          <StopMarker
            id={`to-${s.id}`}
            coordinate={[s.to_lon, s.to_lat]}
            title="Destinazione"
          />
        </React.Fragment>
      ))}

      {/* Polyline percorso selezionato */}
      {route && (
        <MapLibreGL.ShapeSource
          id="routeLine"
          shape={{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route.steps.flatMap((s: any) =>
                (s.geometry || []).map((p: any) => [p.lon, p.lat])
              ),
            },
          }}
        >
          <MapLibreGL.LineLayer
            id="routeLayer"
            style={{ lineColor: "#4CAF50", lineWidth: 4 }}
          />
        </MapLibreGL.ShapeSource>
      )}
    </MapLibreGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});





