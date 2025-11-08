import React, { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl, { Marker, Map, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMap } from "@/context/MapContext";
import { useLocationStore } from '@/store/locationStore';
import { useMapStore } from '@/store/mapStore';
import { useStopsStore } from '@/store/stopsStore';
import { Route } from '@/app/api/plan-trip/route';
import { useRoutesStore } from '@/store/routesStore';
import { useFetchRoutes } from '@/hooks/use-fetch-routes';
import { useInputStateStore } from '@/store/inputsStateStore';
import { reverseNominatim } from '@/hooks/use-nomination';
import { useAdminStore } from '@/store/adminStore';
import { tripHistoryToGeoJSON } from '@/utils/adminUtils';
import { useGetTripHistoryQuery } from '@/redux/services/tripHistoryApi';

interface Coordinate {
  lat: number;
  lon: number;
}

interface MapLibreProps {
  onMapClick: (lat: number, lng: number) => void;
  isAdminMode?: boolean;
}

interface TransportConfig {
  color: string;
  icon: string;
  dashArray?: number[];
}

// Constants
const MAPTILER_API_KEY = 'FcUd8A9NfAmbxojT9gM7';

const MAP_STYLES = {
  streets: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`,
  osm: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_API_KEY}`,
};

const TRANSPORT_CONFIG: Record<string, TransportConfig> = {
  walk: { color: "#10b981", icon: "🚶", dashArray: [2, 4] },
  bus: { color: "#3b82f6", icon: "🚌" },
  bicycle: { color: "#facc15", icon: "🚲" },
  scooter: { color: "#a855f7", icon: "🛴" },
  transit: { color: "#F59E0B", icon: "🚌" },
  driving: { color: "#3B82F6", icon: "🚗" },
  cycling: { color: "#059669", icon: "🚲" },
  walking: { color: "#10B981", icon: "🚶", dashArray: [2, 4] },
  other: { color: "#6b7280", icon: "❓" }
};

// Utility functions
export const getMapStyle = (style: string): string => {
  return MAP_STYLES[style as keyof typeof MAP_STYLES] || MAP_STYLES.streets;
};

const getTransportConfig = (mode: string): TransportConfig => {
  return TRANSPORT_CONFIG[mode] || TRANSPORT_CONFIG.other;
};

const HEATMAP_ZOOM_THRESHOLD = 14;


// Function to calculate midpoint of a LineString
const calculateMidpoint = (coordinates: [number, number][]): [number, number] => {
  if (coordinates.length === 0) return [0, 0];
  if (coordinates.length === 1) return coordinates[0];

  // Calculate total distance along the line
  let totalDistance = 0;
  const distances: number[] = [0];

  for (let i = 1; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i - 1];
    const [lng2, lat2] = coordinates[i];

    // Simple distance calculation (not accounting for Earth's curvature for simplicity)
    const distance = Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
    totalDistance += distance;
    distances.push(totalDistance);
  }

  // Find the point at half the total distance
  const halfDistance = totalDistance / 2;

  for (let i = 1; i < distances.length; i++) {
    if (distances[i] >= halfDistance) {
      const segmentStart = distances[i - 1];
      const segmentEnd = distances[i];
      const segmentLength = segmentEnd - segmentStart;
      const remainingDistance = halfDistance - segmentStart;
      const ratio = remainingDistance / segmentLength;

      const [lng1, lat1] = coordinates[i - 1];
      const [lng2, lat2] = coordinates[i];

      const midLng = lng1 + (lng2 - lng1) * ratio;
      const midLat = lat1 + (lat2 - lat1) * ratio;

      return [midLng, midLat];
    }
  }

  // Fallback to geometric center
  return coordinates[Math.floor(coordinates.length / 2)];
};

const MapLibre: React.FC<MapLibreProps> = ({
  onMapClick,
  isAdminMode = false,
}) => {
  // Refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const { map, originMarker, destinationMarker } = useMap();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const routeLayersRef = useRef<Set<string>>(new Set());
  const stopsListenersAttached = useRef(false);
  const imageLoadedRef = useRef(false);
  const { routes, selectedRouteIndex} = useRoutesStore()
  const heatmapInitializedRef = useRef(false); // Track if heatmap is initialized


  const prevCoords = useRef<{ origin: Coordinate | null, destination: Coordinate | null }>({ origin: null, destination: null });
  
  const { setOrigin, setDestination, origin, destination } = useLocationStore();
  const { is3D, mapView, setMapView, mapStyle } = useMapStore();
  const { stopsGeoJson, loading, fetchStops } = useStopsStore();
  const { fetchRoutes } = useFetchRoutes()
    const { tripHistory, setTripHistory } = useAdminStore()
    
    // Fetch trip history using RTK Query when in admin mode
    const { data: tripHistoryData, isLoading: isTripHistoryLoading } = useGetTripHistoryQuery(undefined, {
      skip: !isAdminMode, // Only fetch when admin mode is enabled
    });

  const { originInputText, setDestInputText, setOriginInputText, destInputText } = useInputStateStore()

    // Helper function to set layer visibility
    const setLayerVisibility = useCallback((layerId: string, visibility: 'visible' | 'none') => {
      if (!map.current) return;
      
      try {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, 'visibility', visibility);
        }
      } catch (error) {
        console.warn(`Error setting visibility for layer ${layerId}:`, error);
      }
    }, []);

  // Initialize stops data once
  useEffect(() => {
    if (!loading && (!stopsGeoJson.features || stopsGeoJson.features.length === 0)) {
      fetchStops();
    }
  }, [loading, stopsGeoJson, fetchStops]);

    // Store trip history data from RTK Query into Zustand store
    useEffect(() => {
      if (tripHistoryData && tripHistoryData.length > 0) {
        console.log('Trip history fetched from API:', tripHistoryData.length, 'trips');
        setTripHistory(tripHistoryData);
      }
    }, [tripHistoryData, setTripHistory]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize MapLibre GL JS
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(mapStyle),
      center: mapView.center,
      zoom: mapView.zoom,
      pitch: is3D ? 45 : mapView.pitch,
      bearing: mapView.bearing,
      maplibreLogo: false,
      attributionControl: false
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-right');

    const geoLocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    map.current.addControl(geoLocate, 'bottom-right');

    // Event listeners
    map.current.on('moveend', () => {
      if (!map.current) return;
      const c = map.current.getCenter();
      setMapView({
        center: [c.lng, c.lat],
        zoom: map.current.getZoom(),
        pitch: map.current.getPitch(),
        bearing: map.current.getBearing(),
      });
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      initializeStopsLayer();
      if (is3D) {
        add3DBuildingsLayer();
      }
    });

    // map.current.on('styleimagemissing', async (e) => {
    //   if (e && e.id && map.current) {
    //     // Optionally add a placeholder image or handle gracefully
    //     const image = await map.current.loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Cat_silhouette.svg/400px-Cat_silhouette.svg.png');
    //     // console.log("image loaded", image.data)
    //     if (!map.current.hasImage(e.id)) map.current.addImage(e.id, image.data);
    //   }
    // });

    // Cleanup function
    return () => {
      if (originMarker.current) {
        originMarker.current.remove();
        originMarker.current = null;
      }
      if (destinationMarker.current) {
        destinationMarker.current.remove();
        destinationMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setIsMapLoaded(false);
    };
  }, []); // Only run once on mount


  // Handle map style changes WITHOUT re-initializing the map
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    map.current.setStyle(getMapStyle(mapStyle));
    

    map.current.once('idle', () => {
    if(isAdminMode) {
      initializeHeatmapLayer();
      initializeStopsLayer();
      handleLayerVisibility()
    }else {
      initializeStopsLayer();
    }
      if (is3D) add3DBuildingsLayer();
      renderRoutes();
      updateMarkers();
    });
  }, [mapStyle]);

  // Handle 3D toggle WITHOUT re-initializing the map
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Animate pitch change
    map.current.easeTo({
      pitch: is3D ? 45 : 0,
      duration: 1000
    });

    // Add or remove 3D buildings
    if (is3D) {
      if (!map.current.getLayer('3d-buildings')) {
        add3DBuildingsLayer();
      }
    } else {
      if (map.current.getLayer('3d-buildings')) {
        try {
          map.current.removeLayer('3d-buildings');
        } catch (error) {
          console.warn('Error removing 3d-buildings layer:', error);
        }
      }
    }
  }, [is3D, isMapLoaded]);

  // stops event listeners
  const addStopsEventListeners = useCallback(() => {
    if (!map.current) return;

    // Cluster click
    map.current.on('click', 'clusters', async (e) => {
      try {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });

        if (features.length) {
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current!.getSource('stops') as any;

          if (source && clusterId && source.getClusterExpansionZoom) {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            const geometry = features[0].geometry as any;

            map.current!.easeTo({
              center: geometry.coordinates,
              zoom: Math.min(zoom, 20)
            });
          }
        }
      } catch (error) {
        console.warn('Error handling cluster click:', error);
      }
    });

    // Stop click
    map.current.on('click', 'unclustered-point', (e) => {
      try {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point']
        });

        if (features.length) {
          const coordinates = (features[0].geometry as any).coordinates.slice();
          const stopName = features[0].properties?.name || 'Transit Stop';

          new maplibregl.Popup({ closeOnClick: true })
            .setLngLat(coordinates)
            .setHTML(
              `<div class="p-2">
              <strong>${stopName}</strong>
              </div>`
            )
            .addTo(map.current!);
        }
      } catch (error) {
        console.warn('Error handling stop click:', error);
      }
    });

    // Cursor changes
    ['clusters', 'unclustered-point'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.on('mouseenter', layerId, () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        map.current!.on('mouseleave', layerId, () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    });
  }, []);

  // Initialize heatmap layer for trip history
  const initializeHeatmapLayer = useCallback(() => {
    if (!map.current || !tripHistory || tripHistory.length === 0) {
      console.log('No trip history data for heatmap');
      return;
    }

    // Prevent double initialization
    if (heatmapInitializedRef.current && map.current.getLayer('trip-heatmap')) {
      console.log('Heatmap already initialized, skipping...');
      return;
    }

    try {
      // Remove existing heatmap layers if they exist
      ['trip-heatmap', 'trip-heatmap-origin', 'trip-heatmap-destination'].forEach(layerId => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      // Remove existing sources
      ['trip-heatmap-data', 'trip-origin-data', 'trip-destination-data'].forEach(sourceId => {
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      });

      // Convert trip history to GeoJSON (both origins and destinations)
      const tripGeoJSON = tripHistoryToGeoJSON(tripHistory, 'both') as GeoJSON.FeatureCollection;

      console.log('Trip history GeoJSON:', tripGeoJSON.features.length, 'points');

      // Add trip heatmap source
      map.current.addSource('trip-heatmap-data', {
        type: 'geojson',
        data: tripGeoJSON,
      });

      // Determine where to insert the layer
      // Try to add before 'clusters', but if it doesn't exist, just add normally
      let beforeLayerId: string | undefined;
      if (map.current.getLayer('clusters')) {
        beforeLayerId = 'clusters';
      } else if (map.current.getLayer('waterway')) {
        beforeLayerId = 'waterway';
      }

      // Add heatmap layer for all trips
      const heatmapLayer: any = {
        id: 'trip-heatmap',
        type: 'heatmap',
        source: 'trip-heatmap-data',
        paint: {
          // Increase weight for better visibility
          'heatmap-weight': 1,
          // Increase intensity as zoom level increases
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            HEATMAP_ZOOM_THRESHOLD, 0.5
          ],
          // Color ramp for heatmap - Blue (low) to Red (high)
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 3,
            5, 10,
            10, 20,
            HEATMAP_ZOOM_THRESHOLD, 30
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 0.8,
            HEATMAP_ZOOM_THRESHOLD - 1, 0.6,
            HEATMAP_ZOOM_THRESHOLD, 0
          ]
        }
      };

      // Add layer with or without beforeId
      if (beforeLayerId) {
        map.current.addLayer(heatmapLayer, beforeLayerId);
        console.log(`Trip history heatmap layer added before '${beforeLayerId}'`);
      } else {
        map.current.addLayer(heatmapLayer);
        console.log('Trip history heatmap layer added without beforeId');
      }

      // Mark as initialized
      heatmapInitializedRef.current = true;
      console.log('Trip history heatmap layer initialized successfully');
    } catch (error) {
      console.error('Error initializing trip history heatmap layer:', error);
      heatmapInitializedRef.current = false;
    }
  }, [tripHistory]);


  const initializeStopsLayer = useCallback(async () => {
    const m = map.current;
    if (!m || !stopsGeoJson?.features?.length) return;

    // Ensure the custom marker image exists (with proper race condition handling)
    try {
      if (!m.hasImage('custom-marker') && !imageLoadedRef.current) {
        imageLoadedRef.current = true; // Set flag before async operation
        const img = await m.loadImage(
          'https://maplibre.org/maplibre-gl-js/docs/assets/osgeo-logo.png'
        );
        // Check again after async operation completes
        if (!m.hasImage('custom-marker')) {
          m.addImage('custom-marker', img.data);
        }
      }
    } catch (e: any) {
      // Reset flag on error
      imageLoadedRef.current = false;
      // If a concurrent call added it already, that's fine
      if (!String(e?.message || '').includes('already exists')) {
        console.warn('addImage(custom-marker) failed:', e);
      }
    }

    // Source: update if present, otherwise add
    const src = m.getSource('stops') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(stopsGeoJson as any);
    } else {
      m.addSource('stops', {
        type: 'geojson',
        data: stopsGeoJson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40,
      });
    }

    // Helper: add layer only if it doesn't exist
    const ensureLayer = (spec: maplibregl.LayerSpecification) => {
      if (!m.getLayer(spec.id)) m.addLayer(spec);
    };

    // Layers: add if missing (no remove/re-add churn)
    ensureLayer({
      id: 'clusters',
      type: 'circle',
      source: 'stops',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          50,
          '#f1f075',
          100,
          '#f28cb1',
          457,
          '#d7263d',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          50,
          20,
          100,
          30,
          457,
          40,
        ],
      },
    });

    ensureLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stops',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });

    if (m.hasImage('custom-marker')) {
      ensureLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'stops',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'custom-marker',
          'text-offset': [0, 1.25],
          'text-anchor': 'top',
        },
      });
    }

    // Event listeners: attach once
    if (!stopsListenersAttached.current) {
      addStopsEventListeners();
      stopsListenersAttached.current = true;
    }
  }, [stopsGeoJson, addStopsEventListeners]);

  // Handle layer visibility based on admin mode and zoom level
  const handleLayerVisibility = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    const currentZoom = map.current.getZoom();

    if (isAdminMode) {
      if (currentZoom < HEATMAP_ZOOM_THRESHOLD) {
        // Low zoom: show heatmap, hide stops
        setLayerVisibility('trip-heatmap', 'visible');
        setLayerVisibility('clusters', 'none');
        setLayerVisibility('cluster-count', 'none');
        setLayerVisibility('unclustered-point', 'none');
        console.log('Admin mode: Showing trip heatmap (zoom < 14)');
      } else {
        // High zoom: hide heatmap, show stops
        setLayerVisibility('trip-heatmap', 'none');
        setLayerVisibility('clusters', 'visible');
        setLayerVisibility('cluster-count', 'visible');
        setLayerVisibility('unclustered-point', 'visible');
        console.log('Admin mode: Showing stops (zoom >= 14)');
      }
    } else {
      // User mode: hide heatmap, always show stops
      setLayerVisibility('trip-heatmap', 'none');
      setLayerVisibility('clusters', 'visible');
      setLayerVisibility('cluster-count', 'visible');
      setLayerVisibility('unclustered-point', 'visible');
      console.log('User mode: Showing stops only');
    }
  }, [isAdminMode, isMapLoaded, setLayerVisibility]);

  // Handle admin mode changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    // Initialize heatmap when entering admin mode
    if (isAdminMode && tripHistory.length > 0) {
      // delay to ensure all layers are ready
      const timer = setTimeout(() => {
        initializeHeatmapLayer();
        handleLayerVisibility();
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      handleLayerVisibility();
    }
  }, [isAdminMode, isMapLoaded, tripHistory, handleLayerVisibility, initializeHeatmapLayer]);

  // Zoom event listener for dynamic layer switching
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const handleZoom = () => {
      handleLayerVisibility();
    };

    map.current.on('zoom', handleZoom);

    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoom);
      }
    };
  }, [isMapLoaded, handleLayerVisibility]);

  // Add 3D buildings layer
  const add3DBuildingsLayer = useCallback(() => {
    if (!map.current || map.current.getLayer('3d-buildings')) return;

    try {
      // Check if the source exists before adding the layer
      if (map.current.getSource('openmaptiles')) {
        map.current.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      }
    } catch (error) {
      console.error('Error adding 3D buildings:', error);
    }
  }, []);

  // Clean up route layers
  const cleanupRouteLayers = useCallback(() => {
    if (!map.current) return;

    routeLayersRef.current.forEach(layerId => {
      try {
        // Clean up HTML markers
        if (layerId.startsWith('marker-')) {
          const routeMarkers = (window as any).routeMarkers;
          if (routeMarkers && routeMarkers.has(layerId)) {
            routeMarkers.get(layerId).remove();
            routeMarkers.delete(layerId);
          }
        } else {
          // Clean up map layers and sources
          if (map.current!.getLayer(layerId)) {
            map.current!.removeLayer(layerId);
          }
          if (map.current!.getSource(layerId)) {
            map.current!.removeSource(layerId);
          }
        }
      } catch (error) {
        console.warn(`Failed to remove layer ${layerId}:`, error);
      }
    });

    routeLayersRef.current.clear();
  }, []);

  // Render routes
  const renderRoutes = useCallback(() => {
    if (!map.current || !isMapLoaded) return;
    if (!routes || routes.length === 0) {
      console.log('No routes available to render');
      cleanupRouteLayers();
      return;
    }

    cleanupRouteLayers();

    const addRouteToMap = (route: Route, routeIdx: number) => {
      console.log('Adding route to map:', route.id, 'Steps:', route.steps?.length);

      route.steps?.forEach((step, stepIdx) => {
        const config = getTransportConfig(step.type);
        const lineId = `route-line-${route.id}-${stepIdx}`;
        const annotationId = `route-annotation-${route.id}-${stepIdx}`;

        console.log(`Processing step ${stepIdx}:`, step.type, 'Geometry:', step.geometry);

        let coords: [number, number][] = [];
        if (Array.isArray(step.geometry)) {
          coords = step.geometry.map((coord: any) => [coord.lon, coord.lat]);
        }

        if (!coords.length) {
          console.log('No coordinates found for step', stepIdx);
          return;
        }

        console.log(`Step ${stepIdx} coordinates:`, coords.length, 'First:', coords[0], 'Second:', coords[1]);

        try {
          // Add line
          map.current!.addSource(lineId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
              properties: {},
            },
          });

          const lineLayer: any = {
            id: lineId,
            type: 'line',
            source: lineId,
            paint: {
              'line-color': config.color,
              'line-width': 4,
              'line-opacity': selectedRouteIndex === null ||
                selectedRouteIndex === -1 ||
                selectedRouteIndex === routeIdx ? 0.9 : 0.4,
            },
          };

          if (config.dashArray) {
            lineLayer.paint['line-dasharray'] = config.dashArray;
          }

          map.current!.addLayer(lineLayer);
          routeLayersRef.current.add(lineId);

          // Create popup block annotation at the midpoint of the route
          if (coords.length >= 2) {
            const midpoint = calculateMidpoint(coords);
            console.log(`Adding popup annotation for step ${stepIdx} at midpoint:`, midpoint);

            // Create popup-style HTML marker
            const markerEl = document.createElement('div');
            markerEl.className = 'route-annotation-popup';
            markerEl.innerHTML = `
              <div style="
                background-color: ${config.color};
                color: white;
                padding: 4px 6px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                position: relative;
                z-index: 1000;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 2px;
                min-width: 40px;
                justify-content: center;
              ">
                <span style="font-size: 30px;">${config.icon}</span>
                <span style="text-transform: capitalize; font-size:12px">${step.duration}</span>
              </div>
              <div style="
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid ${config.color};
                filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
              "></div>
            `;

            const htmlMarker = new maplibregl.Marker({
              element: markerEl,
              anchor: 'bottom'
            })
              .setLngLat(midpoint)
              .addTo(map.current!);

            console.log('Popup-style HTML marker created and added for step', stepIdx);

            // Store HTML marker for cleanup
            const markerId = `marker-${annotationId}`;
            routeLayersRef.current.add(markerId);
            if (typeof window !== 'undefined') {
              if (!(window as any).routeMarkers) {
                (window as any).routeMarkers = new window.Map();
              }
              (window as any).routeMarkers.set(markerId, htmlMarker);
            }
          }
        } catch (error) {
          console.error(`Error adding route ${lineId}:`, error);
        }
      });
    };

    // Filter and render routes
    if (selectedRouteIndex !== null && selectedRouteIndex >= 0) {
      if (routes[selectedRouteIndex]) {
        addRouteToMap(routes[selectedRouteIndex], selectedRouteIndex);
      }
    } else {
      routes.forEach((route, idx) => addRouteToMap(route, idx));
    }
  }, [routes, selectedRouteIndex, isMapLoaded, cleanupRouteLayers]);

  // Update routes when dependencies change
  useEffect(() => {
    renderRoutes();
  }, [renderRoutes]);

  // Update routes when dependencies change
  useEffect(() => {
    if (!origin || !destination) {
      cleanupRouteLayers();
    }
  }, [origin, destination]);

  // Update stops when data changes
  useEffect(() => {
    if (isMapLoaded && stopsGeoJson.features?.length > 0) {
      initializeStopsLayer();
    }
  }, [stopsGeoJson, isMapLoaded, initializeStopsLayer]);

  // Marker management
  const addOrUpdateMarker = useCallback((
    marker: React.RefObject<maplibregl.Marker | null>,
    coord: Coordinate,
    onDragEnd: (coord: Coordinate) => void,
    color: string,
    type: string
  ) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }


    marker.current = new Marker({ color, draggable: true })
      // marker.current = new Marker({ color, element: el, draggable: true })
      .setLngLat([coord.lon, coord.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<h3>${type}</h3>`))
      .addTo(map.current);

    marker.current.on('dragend', async () => {
      if (marker.current) {

        const lngLat = marker.current.getLngLat();
        onDragEnd({ lat: lngLat.lat, lon: lngLat.lng });

        if (type === 'Origin') {
          if (routes.length > 0 && routes[0].fromStationName !== originInputText) {
            setOriginInputText(routes[0].fromStationName);
          }
          else {
            async function fetchname() {
              if (lngLat.lat && lngLat.lng) {
                const placeName = await reverseNominatim(lngLat.lat, lngLat.lng);
                if (placeName) {
                  setOriginInputText(placeName);
                }
              }
            }
            fetchname()
          }
        }
        if (type === 'Destination') {
          async function fetchname() {
            if (lngLat.lat && lngLat.lng) {
              const placeName = await reverseNominatim(lngLat.lat, lngLat.lng);
              if (placeName) {
                setDestInputText(placeName);
              }
            }
          }
          fetchname()
        }

      }
    });
  }, []);

  // Update markers
  const updateMarkers = useCallback(() => {
    if (origin) {
      addOrUpdateMarker(originMarker, origin, setOrigin, '#10B981', "Origin");
    }
    if (destination) {
      addOrUpdateMarker(destinationMarker, destination, setDestination, '#EF4444', 'Destination');
    }
  }, [origin, destination, addOrUpdateMarker, setOrigin, setDestination]);

  // Update markers when locations change
  useEffect(() => {
    if (!isMapLoaded) return;
    updateMarkers();
  }, [origin, destination, isMapLoaded, updateMarkers]);

  // Fit map to bounds
  const fitMapToBounds = useCallback(() => {
    if (!map.current || !origin || !destination) return;

    const bounds = new LngLatBounds();
    bounds.extend([origin.lon, origin.lat]);
    bounds.extend([destination.lon, destination.lat]);

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 16
    });
  }, [origin, destination]);

  // Auto-fit bounds
  useEffect(() => {
    if (isMapLoaded && origin && destination) {
      const timer = setTimeout(fitMapToBounds, 100);
      return () => clearTimeout(timer);
    }
  }, [origin, destination, isMapLoaded, fitMapToBounds]);

  // Auto-fetch routes when origin/destination change
  useEffect(() => {
    if (
      origin &&
      destination &&
      (
        prevCoords.current.origin?.lat !== origin.lat ||
        prevCoords.current.origin?.lon !== origin.lon ||
        prevCoords.current.destination?.lat !== destination.lat ||
        prevCoords.current.destination?.lon !== destination.lon
      )
    ) {
      console.log(`Origin: ${origin.lat}, ${origin.lon} | Destination: ${destination.lat}, ${destination.lon}`);

      fetchRoutes();
      prevCoords.current = { origin, destination };
    }
  }, [origin, destination]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
    />
  );
};

export default MapLibre;