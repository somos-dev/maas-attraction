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

  const fromCoord =
    route?.fromLat && route?.fromLon ? [route.fromLon, route.fromLat] : null;
  const toCoord =
    route?.toLat && route?.toLon ? [route.toLon, route.toLat] : null;

  // ✅ usa legs.geometry (array di {lat, lon}) già normalizzato
  const lineCoords =
    route?.legs?.flatMap((leg: any) =>
      (leg.geometry || []).map((p: any) => [p.lon, p.lat])
    ) || [];

  return (
    <MapLibreGL.MapView style={StyleSheet.absoluteFillObject}>
      {/* Raster OSM */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"]}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
      </MapLibreGL.RasterSource>

      {/* Camera centrata su origine → fallback utente → Arcavacata */}
      <MapLibreGL.Camera
        zoomLevel={14}
        centerCoordinate={
          fromCoord
            ? fromCoord
            : location || [16.22727, 39.35589]
        }
      />

      {/* Marker utente */}
      {location && (
        <Marker id="user-location" coordinate={location} color="#2196F3" />
      )}

      {/* Marker origine/destinazione */}
      {fromCoord && (
        <StopMarker id="origin" coordinate={fromCoord} title="Origine" />
      )}
      {toCoord && (
        <StopMarker id="destination" coordinate={toCoord} title="Destinazione" />
      )}

      {/* ✅ Polyline dai legs */}
      {lineCoords.length > 0 && (
        <MapLibreGL.ShapeSource
          id="routeLine"
          shape={{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: lineCoords,
            },
          }}
        >
          <MapLibreGL.LineLayer
            id="routeLayer"
            style={{
              lineColor: "#4CAF50",
              lineWidth: 4,
              lineJoin: "round",
              lineCap: "round",
            }}
          />
        </MapLibreGL.ShapeSource>
      )}
    </MapLibreGL.MapView>
  );
}












