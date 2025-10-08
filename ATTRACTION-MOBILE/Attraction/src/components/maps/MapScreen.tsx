// src/components/maps/MapView.tsx
import React, {useEffect, useState} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {
  MapView,
  ShapeSource,
  RasterSource,
  RasterLayer,
  Camera,
  LineLayer,
  setAccessToken,
} from '@maplibre/maplibre-react-native';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import StopMarker from './StopMarker';
import Marker from './Marker';

setAccessToken(null);

interface MapViewProps {
  route?: any; // percorso selezionato dalla ResultsScreen
}

export default function MapScreen({route}: MapViewProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);

  // chiedi permessi + ottieni posizione utente
  useEffect(() => {
    const requestLocation = async () => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE // o LOCATION_ALWAYS se ti serve
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        if (Platform.OS === 'ios') {
          Geolocation.requestAuthorization('whenInUse');
        }
        Geolocation.getCurrentPosition(
          pos => {
            const {longitude, latitude} = pos.coords;
            setLocation([longitude, latitude]); // [lon, lat]
          },
          err => console.error('Geolocation error:', err),
          {enableHighAccuracy: true},
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
    <MapView style={styles.map}>
      {/* Raster OSM */}
      <RasterSource
        id="osm"
        tileUrlTemplates={['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png']}
        tileSize={256}>
        <RasterLayer id="osmLayer" sourceID="osm" />
      </RasterSource>

      {/* Camera centrata su origine o posizione */}
      <Camera
        zoomLevel={14}
        centerCoordinate={
          fromCoord ? fromCoord : location || [16.22727, 39.35589] // fallback Arcavacata
        }
      />

      {/* Marker posizione utente */}
      {location && (
        <Marker id="user-location" coordinate={location} color="#2196F3" />
      )}

      {/* Marker origine/destinazione */}
      {fromCoord && (
        <StopMarker id="origin" coordinate={fromCoord} title="Origine" />
      )}
      {toCoord && (
        <StopMarker
          id="destination"
          coordinate={toCoord}
          title="Destinazione"
        />
      )}

      {/* Polyline percorso selezionato */}
      {route && route.steps && (
        <ShapeSource
          id="routeLine"
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.steps.flatMap((s: any) =>
                (s.geometry || []).map((p: any) => [p.lon, p.lat]),
              ),
            },
          }}>
          <LineLayer
            id="routeLayer"
            style={{lineColor: '#4CAF50', lineWidth: 4}}
          />
        </ShapeSource>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
