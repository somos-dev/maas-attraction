import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

import StopMarker from "./StopMarker";
import { useGetSearchesQuery } from "../../store/api/searchApi";

MapLibreGL.setAccessToken(null);

export default function MapView() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const { data: searches = [] } = useGetSearchesQuery();

  // chiedi permessi + ottieni posizione
  useEffect(() => {
    const requestLocation = async () => {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          pos => {
            const { longitude, latitude } = pos.coords;
            setLocation([longitude, latitude]);
          },
          err => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    };
    requestLocation();
  }, []);

  return (
    <MapLibreGL.MapView style={styles.map}>
      {/* RasterSource OSM → elimina sfondo giallo */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={[
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ]}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer
          id="osmLayer"
          sourceID="osm"
          style={{ rasterOpacity: 1 }}
        />
      </MapLibreGL.RasterSource>

      {/* Camera centrata su posizione utente o default Arcavacata */}
      <MapLibreGL.Camera
        zoomLevel={14}
        centerCoordinate={location || [16.22727, 39.35589]}
      />

      {/* marker utente */}
      {location && (
        <MapLibreGL.PointAnnotation id="me" coordinate={location} />
      )}

      {/* marker da API /search/ */}
      {searches.map(s => (
        <React.Fragment key={s.id}>
          <StopMarker
            id={`from-${s.id}`}
            coordinate={[s.from_lon, s.from_lat]}
            title={`Origine ${s.id}`}
          />
          <StopMarker
            id={`to-${s.id}`}
            coordinate={[s.to_lon, s.to_lat]}
            title={`Destinazione ${s.id}`}
          />
        </React.Fragment>
      ))}
    </MapLibreGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

