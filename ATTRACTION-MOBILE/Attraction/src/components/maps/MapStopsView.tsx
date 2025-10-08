// src/components/maps/MapStopsView.tsx
import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View, Text, Pressable} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Marker from './Marker'; // per la posizione utente
import {useTheme} from 'react-native-paper';

MapLibreGL.setAccessToken(null);

export type StopPoint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

type Props = {
  stops: StopPoint[];
  userLocation?: [number, number] | null; // [lon, lat]
  showUser?: boolean; // default true
  showRadius?: boolean; // default true
  radius?: number; // meters, default 200
  selectedStopId?: string;
  onSelectStop?: (stop: StopPoint) => void;
  lineColor?: string; // colore per raggio/marker selezionato
  onOpenSelectedStop?: (stop: StopPoint) => void;
};

const DEFAULT_CENTER: [number, number] = [16.22727, 39.35589]; // Unical

// --- utils distanza ---
const toRad = (d: number) => (d * Math.PI) / 180;
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // m
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const formatDistance = (m: number) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

// --- cerchio raggio (poligono semplice) ---
const makeRadiusFeature = (center?: [number, number] | null, radius = 200) => {
  if (!center) return null;
  const [lon, lat] = center;
  const R = 6378137; // m
  const steps = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const dx =
      (radius * Math.cos(theta)) / (R * Math.cos((lat * Math.PI) / 180));
    const dy = (radius * Math.sin(theta)) / R;
    const clat = lat + (dy * 180) / Math.PI;
    const clon = lon + (dx * 180) / Math.PI;
    coords.push([clon, clat]);
  }
  return {
    type: 'Feature' as const,
    geometry: {type: 'Polygon' as const, coordinates: [coords]},
    properties: {},
  };
};

export default function MapStopsView({
  stops,
  userLocation = null,
  showUser = true,
  showRadius = true,
  radius = 200,
  selectedStopId,
  onSelectStop,
  lineColor = '#1E88E5',
  onOpenSelectedStop,
}: Props) {
  const theme = useTheme();
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  // FeatureCollection per tutte le fermate (tappabile via onPress)
  const stopsFC = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: stops.map(s => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lon, s.lat] as [number, number],
        },
        properties: {
          id: s.id,
          name: s.name,
          lon: s.lon,
          lat: s.lat,
        },
      })),
    }),
    [stops],
  );

  // Sorgente dedicata per la fermata selezionata (cerchio più grande)
  const selectedFC = useMemo(() => {
    const sel = stops.find(s => s.id === selectedStopId);
    if (!sel) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [sel.lon, sel.lat] as [number, number],
          },
          properties: {
            id: sel.id,
            name: sel.name,
          },
        },
      ],
    };
  }, [selectedStopId, stops]);

  // Fit bounds su fermate + utente
  useEffect(() => {
    const pts: [number, number][] = [];
    if (userLocation) pts.push(userLocation);
    stops.forEach(s => pts.push([s.lon, s.lat]));
    if (pts.length === 0 || !cameraRef.current) return;

    const lons = pts.map(p => p[0]);
    const lats = pts.map(p => p[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lonPad = (maxLon - minLon) * 0.2 || 0.01;
    const latPad = (maxLat - minLat) * 0.2 || 0.01;

    cameraRef.current.fitBounds(
      [minLon - lonPad, minLat - latPad],
      [maxLon + lonPad, maxLat + latPad],
      60,
      600,
    );
  }, [JSON.stringify(stops), userLocation]);

  const radiusFeature = useMemo(
    () => (showRadius ? makeRadiusFeature(userLocation || null, radius) : null),
    [userLocation, showRadius, radius],
  );

  const selectedStop = useMemo(
    () => stops.find(s => s.id === selectedStopId),
    [stops, selectedStopId],
  );
  const selectedDistance = useMemo(() => {
    if (!selectedStop || !userLocation) return null;
    const [lon, lat] = userLocation;
    return haversine(lat, lon, selectedStop.lat, selectedStop.lon);
  }, [selectedStop, userLocation]);

  // handler tap su una feature del layer fermate
  const handleStopsPress = (e: any) => {
    const f = e?.features?.[0];
    const id = f?.properties?.id;
    if (!id) return;
    const s = stops.find(x => x.id === String(id));
    if (s) onSelectStop?.(s);
  };

  return (
    <View style={{flex: 1}}>
      <MapLibreGL.MapView
        style={StyleSheet.absoluteFillObject}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled
        styleURL="https://demotiles.maplibre.org/style.json">
        {/* Base raster OSM */}
        <MapLibreGL.RasterSource
          id="osm"
          tileUrlTemplates={[
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ]}
          tileSize={256}>
          <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
        </MapLibreGL.RasterSource>

        {/* Camera */}
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={userLocation || DEFAULT_CENTER}
          animationMode="flyTo"
          animationDuration={600}
        />

        {/* Cerchio raggio */}
        {radiusFeature && (
          <MapLibreGL.ShapeSource id="radius-source" shape={radiusFeature}>
            <MapLibreGL.FillLayer
              id="radius-fill"
              style={{fillColor: lineColor, fillOpacity: 0.12}}
            />
            <MapLibreGL.LineLayer
              id="radius-stroke"
              style={{lineColor: lineColor, lineWidth: 2}}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Posizione utente */}
        {showUser && userLocation && (
          <Marker
            id="me"
            coordinate={userLocation}
            color={lineColor}
            size={8}
            showHalo
          />
        )}

        {/* Fermate (tappabili) */}
        <MapLibreGL.ShapeSource
          id="stops-source"
          shape={stopsFC}
          onPress={handleStopsPress}>
          {/* layer base: puntini piccoli */}
          <MapLibreGL.CircleLayer
            id="stops-layer"
            style={{
              circleRadius: 8,
              circleColor: theme.colors.primary,
              circleOpacity: 0.9,
              circleStrokeWidth: 1,
              circleStrokeColor: '#fff',
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* Fermata selezionata (cerchio più grande e colorato) */}
        {selectedFC && (
          <MapLibreGL.ShapeSource id="selected-stop-source" shape={selectedFC}>
            <MapLibreGL.CircleLayer
              id="selected-stop-layer"
              style={{
                circleRadius: 10,
                circleColor: 'red',
                circleStrokeWidth: 2,
                circleStrokeColor: '#fff',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* Overlay info fermata selezionata */}
      {selectedStop && (
        <View pointerEvents="box-none" style={styles.calloutOverlay}>
          <Pressable
            onPress={() => onOpenSelectedStop?.(selectedStop)}
            style={[styles.calloutCard, {borderColor: lineColor}]}
            android_ripple={{color: 'rgba(0,0,0,0.08)'}}
            accessibilityRole="button"
            accessibilityLabel={`Apri dettagli fermata ${selectedStop.name}`}>
            <View style={[styles.calloutDot, {backgroundColor: lineColor}]} />
            <View style={{flex: 1}}>
              <Text style={styles.calloutTitle} numberOfLines={1}>
                {selectedStop.name}
              </Text>
              {selectedDistance != null && (
                <Text style={styles.calloutSub}>
                  {formatDistance(selectedDistance)}
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calloutOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  calloutCard: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    maxWidth: 520,
  },
  calloutDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  calloutTitle: {fontWeight: '700'},
  calloutSub: {opacity: 0.7, marginTop: 2},
});
