import React, {useEffect, useState, useRef, useMemo} from 'react';
import {StyleSheet, Platform, View, Image} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import bbox from '@turf/bbox';

import StopMarker from './StopMarker';
import Marker from './Marker';
import drtArea from '../../config/drtArea.json';

MapLibreGL.setAccessToken(null);

interface MapViewProps {
  route?: any;
  showStops?: boolean;
  showMarkers?: boolean;
  highlightColor?: string;
  onLongPress?: (coords: [number, number]) => void;
  selectedCoords?: [number, number] | null;
  drtArea?: any;
  scooters?: any; // 🛴 nuovo prop per i monopattini
}

export default function MapView({
  route,
  showStops = true,
  showMarkers = true,
  highlightColor = '#4CAF50',
  onLongPress,
  selectedCoords,
  drtArea: externalDrtArea,
  scooters, // 🛴
}: MapViewProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          pos => {
            const {longitude, latitude} = pos.coords;
            setLocation([longitude, latitude]);
          },
          err => console.error('Geolocation error:', err),
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    };
    requestLocation();
  }, []);

  const fromCoord =
    route?.fromLat && route?.fromLon ? [route.fromLon, route.fromLat] : null;
  const toCoord =
    route?.toLat && route?.toLon ? [route.toLon, route.toLat] : null;

  const MODE_COLORS: Record<string, string> = {
    walk: '#9E9E9E',
    bus: '#2196F3',
    train: '#FF6F00',
    tram: '#4CAF50',
    subway: '#E91E63',
    car: '#424242',
    bike: '#8BC34A',
    ferry: '#00BCD4',
    scooter: '#00BFA5', // 🛴 nuovo colore
    navetta: '#E53935',
  };

  const segments =
    route?.segments?.map((seg: any, i: number) => {
      const coords =
        seg.geometry?.map((p: any) => [p.lon, p.lat]) ||
        route?.legs?.[i]?.geometry?.map((p: any) => [p.lon, p.lat]) ||
        [];

      const mode = (seg.mode || 'walk').toLowerCase();
      const color = MODE_COLORS[mode] || MODE_COLORS.walk;
      const isWalk = mode === 'walk';
      return {id: `seg-${i}`, coords, color, isWalk};
    }) || [];

  // ✅ Auto-fit camera
  useEffect(() => {
    if (!cameraRef.current) return;

    if (segments.length > 0 || fromCoord || toCoord) {
      const allCoords: [number, number][] = [];
      segments.forEach(s => allCoords.push(...s.coords));
      if (fromCoord) allCoords.push(fromCoord);
      if (toCoord) allCoords.push(toCoord);

      if (allCoords.length > 0) {
        const lons = allCoords.map(c => c[0]);
        const lats = allCoords.map(c => c[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        cameraRef.current.fitBounds(
          [minLon, minLat],
          [maxLon, maxLat],
          80,
          1000,
        );
        return;
      }
    }

    const area = externalDrtArea || drtArea;
    if (area) {
      const [minLon, minLat, maxLon, maxLat] = bbox(area);
      cameraRef.current.fitBounds([minLon, minLat], [maxLon, maxLat], 50, 1000);
    }
  }, [route, externalDrtArea]);

  // FlyTo su punto selezionato
  useEffect(() => {
    if (selectedCoords && cameraRef.current) {
      cameraRef.current.flyTo(selectedCoords, 1000);
    }
  }, [selectedCoords]);

  const handleMapLongPress = (e: any) => {
    const coords =
      e?.geometry?.coordinates ||
      e?.coordinates ||
      (Array.isArray(e) ? e : null);

    if (Array.isArray(coords) && coords.length === 2) {
      onLongPress?.(coords as [number, number]);
    }
  };

  const activeArea = externalDrtArea || null;

  return (
    <MapLibreGL.MapView
      style={StyleSheet.absoluteFillObject}
      logoEnabled={false}
      attributionEnabled={false}
      compassEnabled
      onLongPress={handleMapLongPress}
      styleURL="https://demotiles.maplibre.org/style.json">
      {/* 🗺️ Base OSM raster */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png']}
        tileSize={256}>
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
      </MapLibreGL.RasterSource>

      <MapLibreGL.Camera
        ref={cameraRef}
        zoomLevel={13}
        centerCoordinate={[16.22727, 39.35589]}
        animationMode="flyTo"
        animationDuration={800}
      />

      {/* 🔵 Area DRT */}
      {activeArea && (
        <MapLibreGL.ShapeSource id="drt-area" shape={activeArea}>
          <MapLibreGL.FillLayer
            id="drt-fill"
            style={{
              fillColor: '#007AFF',
              fillOpacity: 0.25,
              fillOutlineColor: '#007AFF',
            }}
          />
          <MapLibreGL.LineLayer
            id="drt-outline"
            style={{
              lineColor: '#007AFF',
              lineWidth: 2,
            }}
          />
        </MapLibreGL.ShapeSource>
      )}

      {/* 🛴 Monopattini (mostra solo quando richiesto) */}
      {useMemo(() => {
        if (
          !scooters ||
          !Array.isArray(scooters?.features) ||
          scooters.features.length === 0
        ) {
          return null;
        }

        return (
          <>
            {/* Carica l’icona solo se serve */}
            <MapLibreGL.Images
              images={{
                scooterIcon: require('../../assets/images/scooter.png'),
              }}
            />
            <MapLibreGL.ShapeSource
              id="scooters-source"
              shape={scooters}
              onPress={e => {
                const f = e?.features?.[0];
                if (f?.properties?.battery) {
                  console.log(
                    `🛴 Monopattino selezionato: batteria ${f.properties.battery}`,
                  );
                }
              }}>
              <MapLibreGL.SymbolLayer
                id="scooters-layer"
                style={{
                  iconImage: 'scooterIcon',
                  iconSize: 0.5,
                  iconAllowOverlap: true,
                  textField: ['get', 'battery'],
                  textSize: 10,
                  textOffset: [0, -1.4],
                  textColor: '#00BFA5',
                }}
              />
            </MapLibreGL.ShapeSource>
          </>
        );
      }, [scooters])}

      {/* 🚶 Segmenti del percorso */}
      {segments.map(seg =>
        seg.coords.length > 0 ? (
          <MapLibreGL.ShapeSource
            key={seg.id}
            id={seg.id}
            shape={{
              type: 'Feature',
              geometry: {type: 'LineString', coordinates: seg.coords},
            }}>
            <MapLibreGL.LineLayer
              id={`${seg.id}-outline`}
              style={{
                lineColor: '#fff',
                lineWidth: seg.isWalk ? 6 : 9,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
            <MapLibreGL.LineLayer
              id={`${seg.id}-main`}
              style={{
                lineColor: seg.color,
                lineWidth: seg.isWalk ? 3 : 6,
                lineJoin: 'round',
                lineCap: 'round',
                ...(seg.isWalk && {lineDasharray: [0.5, 1.5]}),
              }}
            />
          </MapLibreGL.ShapeSource>
        ) : null,
      )}

      {/* 📍 Marker origine/destinazione */}
      {showMarkers && fromCoord && (
        <StopMarker
          id="origin"
          coordinate={fromCoord}
          title="Origine"
          showLabel
        />
      )}
      {showMarkers && toCoord && (
        <StopMarker
          id="destination"
          coordinate={toCoord}
          title="Destinazione"
          showLabel
        />
      )}

      {/* 🔴 Punto selezionato */}
      {selectedCoords && (
        <MapLibreGL.PointAnnotation
          id="selected-point"
          coordinate={selectedCoords}>
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: '#E53935',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#fff',
            }}
          />
        </MapLibreGL.PointAnnotation>
      )}

      {/* 🧍 Posizione utente */}
      {showMarkers && location && (
        <Marker
          id="user"
          coordinate={location}
          color="#2196F3"
          size={8}
          showHalo
        />
      )}

      {/* 🚏 Fermate */}
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

const styles = StyleSheet.create({});
