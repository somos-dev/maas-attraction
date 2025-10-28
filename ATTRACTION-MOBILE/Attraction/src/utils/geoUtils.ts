import {point as turfPoint, booleanPointInPolygon} from '@turf/turf';

/**
 * Verifica se un punto [lon, lat] è contenuto in una o più feature (Polygon o MultiPolygon)
 */
export const isPointInAnyFeature = (
  coords: [number, number],
  geojson: any,
): boolean => {
  if (!geojson) return false;

  const pt = turfPoint(coords);
  const features =
    geojson.type === 'FeatureCollection'
      ? geojson.features
      : geojson.type === 'Feature'
      ? [geojson]
      : [];

  if (features.length === 0) {
    console.warn('⚠️ Nessuna feature valida trovata nel GeoJSON');
    return false;
  }

  return features.some(feature => {
    try {
      if (
        feature.geometry?.type === 'Polygon' ||
        feature.geometry?.type === 'MultiPolygon'
      ) {
        return booleanPointInPolygon(pt, feature);
      }
      return false;
    } catch (e) {
      console.error('Errore nel controllo poligono:', e);
      return false;
    }
  });
};
