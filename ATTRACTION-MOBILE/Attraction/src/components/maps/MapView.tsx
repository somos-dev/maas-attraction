import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Platform } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

import StopMarker from "./StopMarker";
import Marker from "./Marker";

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  route?: any;
  showStops?: boolean;
  showMarkers?: boolean;
  highlightColor?: string;
}

/**
 * MapView — Visualizza percorso e marker su MapLibre
 * - Calcola automaticamente bounds e zoom
 * - Supporta segmenti colorati per modalità (bus, treno, cammino, ecc.)
 * - Mostra posizione utente se disponibile
 */
export default function MapView({
  route,
  showStops = true,
  showMarkers = true,
  highlightColor = "#4CAF50",
}: MapViewProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  // 🔹 Richiedi posizione utente (solo permesso in uso)
  useEffect(() => {
    const requestLocation = async () => {
      const permission =
        Platform.OS === "android"
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            setLocation([longitude, latitude]);
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    };
    requestLocation();
  }, []);

  // 🔹 Coordinate origine/destinazione (ordine corretto [lon, lat])
  const fromCoord =
    route?.fromLat && route?.fromLon ? [route.fromLon, route.fromLat] : null;
  const toCoord =
    route?.toLat && route?.toLon ? [route.toLon, route.toLat] : null;

  // 🎨 Colori per modalità di trasporto
  const MODE_COLORS: Record<string, string> = {
    walk: "#9E9E9E",
    bus: "#2196F3",
    train: "#FF6F00",
    tram: "#4CAF50",
    subway: "#E91E63",
    car: "#424242",
    bike: "#8BC34A",
    ferry: "#00BCD4",
  };

  // 🔹 Costruisci segmenti di percorso
  const segments =
    route?.segments?.map((seg: any, i: number) => {
      const coords =
        seg.geometry?.map((p: any) => [p.lon, p.lat]) ||
        route?.legs?.[i]?.geometry?.map((p: any) => [p.lon, p.lat]) ||
        [];

      const mode = (seg.mode || "walk").toLowerCase();
      const color = MODE_COLORS[mode] || MODE_COLORS.walk;
      const isWalk = mode === "walk";
      return { id: `seg-${i}`, coords, color, isWalk };
    }) || [];

  // 🔹 Calcola bounds per zoom automatico
  useEffect(() => {
    const allCoords: [number, number][] = [];

    segments.forEach((s) => allCoords.push(...s.coords));
    if (fromCoord) allCoords.push(fromCoord);
    if (toCoord) allCoords.push(toCoord);

    if (allCoords.length === 0 || !cameraRef.current) return;

    const lons = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lonPadding = (maxLon - minLon) * 0.2 || 0.01;
    const latPadding = (maxLat - minLat) * 0.2 || 0.01;

    cameraRef.current.fitBounds(
      [minLon - lonPadding, minLat - latPadding],
      [maxLon + lonPadding, maxLat + latPadding],
      80,
      1000
    );
  }, [route]);

  return (
    <MapLibreGL.MapView
      style={StyleSheet.absoluteFillObject}
      logoEnabled={false}
      attributionEnabled={false}
      compassEnabled={true}
      styleURL="https://demotiles.maplibre.org/style.json"
    >
      {/* 🌍 Base map OSM */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"]}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
      </MapLibreGL.RasterSource>

      {/* 📸 Camera controllata */}
      <MapLibreGL.Camera
        ref={cameraRef}
        zoomLevel={13}
        centerCoordinate={location || [16.22727, 39.35589]} // Fallback Unical
        animationMode="flyTo"
        animationDuration={800}
      />

      {/* 🔹 Segmenti del percorso */}
      {segments.map((seg) =>
        seg.coords.length > 0 ? (
          <MapLibreGL.ShapeSource
            key={seg.id}
            id={seg.id}
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: seg.coords },
            }}
          >
            {/* Bordo bianco */}
            <MapLibreGL.LineLayer
              id={`${seg.id}-outline`}
              style={{
                lineColor: "#fff",
                lineWidth: seg.isWalk ? 6 : 9,
                lineJoin: "round",
                lineCap: "round",
              }}
            />
            {/* Colore principale */}
            <MapLibreGL.LineLayer
              id={`${seg.id}-main`}
              style={{
                lineColor: seg.color,
                lineWidth: seg.isWalk ? 3 : 6,
                lineJoin: "round",
                lineCap: "round",
                ...(seg.isWalk && { lineDasharray: [0.5, 1.5] }),
              }}
            />
          </MapLibreGL.ShapeSource>
        ) : null
      )}

      {/* 🔹 Marker origine e destinazione */}
      {showMarkers && fromCoord && (
        <StopMarker id="origin" coordinate={fromCoord} title="Origine" showLabel />
      )}
      {showMarkers && toCoord && (
        <StopMarker id="destination" coordinate={toCoord} title="Destinazione" showLabel />
      )}

      {/* 🔹 Posizione utente */}
      {showMarkers && location && (
        <Marker id="user" coordinate={location} color="#2196F3" size={8} showHalo />
      )}

      {/* 🔹 Fermate intermedie */}
      {showStops &&
        route?.stops?.map((stop: any, i: number) => (
          <StopMarker
            key={`stop-${i}`}
            id={`stop-${i}`}
            coordinate={[stop.lon, stop.lat]}
            title={stop.name || `Fermata ${i + 1}`}
          />
        ))}
    </MapLibreGL.MapView>
  );
}













