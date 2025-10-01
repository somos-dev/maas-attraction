// src/components/maps/MapView.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

import StopMarker from "./StopMarker";
import Marker from "./Marker";

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  route?: any; // percorso selezionato dalla ResultsScreen
}

export default function MapView({ route }: MapViewProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);

  // chiedi permessi + ottieni posizione utente
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

  // estrai origine/destinazione dalla rotta (ora sempre disponibili se fetchTrip ha passato params)
  const fromCoord =
    route?.fromLat && route?.fromLon ? [route.fromLon, route.fromLat] : null;
  const toCoord =
    route?.toLat && route?.toLon ? [route.toLon, route.toLat] : null;

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

      {/* Camera centrata su origine o posizione */}
      <MapLibreGL.Camera
        zoomLevel={14}
        centerCoordinate={
          fromCoord
            ? fromCoord
            : location || [16.22727, 39.35589] // fallback Arcavacata
        }
      />

      {/* Marker posizione utente */}
      {location && (
        <Marker
          id="user-location"
          coordinate={location}
          color="#2196F3"
        />
      )}

      {/* Marker origine/destinazione */}
      {fromCoord && (
        <StopMarker id="origin" coordinate={fromCoord} title="Origine" />
      )}
      {toCoord && (
        <StopMarker id="destination" coordinate={toCoord} title="Destinazione" />
      )}

      {/* Polyline percorso selezionato */}
      {route && route.steps && (
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








