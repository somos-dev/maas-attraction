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
import { useShouldFetchStore } from '@/store/shouldFetchStore';
import { set } from 'date-fns';
import { useInputStateStore } from '@/store/inputsStateStore';
import { reverseNominatim } from '@/hooks/use-nomination';

// Types
interface Coordinate {
  lat: number;
  lon: number;
}

interface MapLibreProps {
  onMapClick: (lat: number, lng: number) => void;
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
  // terrain: `https://api.maptiler.com/maps/terrain/style.json?key=${MAPTILER_API_KEY}`,
  osm: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_API_KEY}`,
  // dark: `https://api.maptiler.com/maps/dark/style.json?key=${MAPTILER_API_KEY}`
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
}) => {
  // Refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const { map, originMarker, destinationMarker } = useMap();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const routeLayersRef = useRef<Set<string>>(new Set());
  const { routes, selectedRouteIndex, setRoutes, setSelectedRouteIndex } = useRoutesStore()
  const { shouldFetch, toggleShouldFetch, setShouldFetch } = useShouldFetchStore()

  const prevCoords = useRef<{origin: Coordinate | null, destination: Coordinate | null}>({origin: null, destination: null});
  // Store hooks
  const { setOrigin, setDestination, origin, destination } = useLocationStore();
  const { is3D, mapView, setMapView, mapStyle } = useMapStore();
  const { stopsGeoJson, loading, fetchStops } = useStopsStore();
  const { fetchRoutes } = useFetchRoutes()

  const { originInputText, setDestInputText, setOriginInputText, destInputText } = useInputStateStore()

  // Initialize stops data once
  useEffect(() => {
    if (!loading && (!stopsGeoJson.features || stopsGeoJson.features.length === 0)) {
      fetchStops();
    }
  }, []);

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

    // Re-add layers after style loads
    map.current.once('styledata', () => {
      // Wait for style to fully load before re-adding layers
      setTimeout(() => {
        initializeStopsLayer();
        if (is3D) {
          add3DBuildingsLayer();
        }
        // Re-add route layers
        renderRoutes();
        // Re-add markers
        updateMarkers();
      }, 100);
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

  // Initialize stops layer
  const initializeStopsLayer = useCallback(async () => {
    if (!map.current || !stopsGeoJson.features?.length) return;

    try {
      // Check if source already exists and remove it
      if (map.current.getSource('stops')) {
        // Remove existing layers first
        ['clusters', 'cluster-count', 'unclustered-point'].forEach(layerId => {
          if (map.current!.getLayer(layerId)) {
            try {
              map.current!.removeLayer(layerId);
            } catch (error) {
              console.warn(`Error removing layer ${layerId}:`, error);
            }
          }
        });

        // Remove source
        try {
          map.current.removeSource('stops');
        } catch (error) {
          console.warn('Error removing stops source:', error);
        }
      }

      // Check if custom marker image already exists
      if (!map.current.getImage('custom-marker')) {
        try {
          const image = await map.current.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/osgeo-logo.png');
          map.current.addImage('custom-marker', image.data);
        } catch (error) {
          console.warn('Error loading custom marker image:', error);
        }
      }

      // Add stops source
      map.current.addSource('stops', {
        type: 'geojson',
        data: stopsGeoJson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40,
      });

      // Add cluster layers
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'stops',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            50, '#f1f075',
            100, '#f28cb1',
            457, '#d7263d'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            50, 20,
            100, 30,
            457, 40
          ]
        },
      });

      map.current.addLayer({
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

      // Only add unclustered-point layer if custom-marker image exists
      if (map.current.getImage('custom-marker')) {
        map.current.addLayer({
          id: "unclustered-point",
          // id: "stop-point",
          type: "symbol",
          source: "stops",
          filter: ["!", ["has", "point_count"]],
          layout: {
            'icon-image': 'custom-marker',
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
          }
        });
      }

      // Add event listeners
      addStopsEventListeners();
    } catch (error) {
      console.error('Error initializing stops layer:', error);
    }
  }, [stopsGeoJson]);

  // Add stops event listeners
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
      .setLngLat([coord.lon, coord.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<h3>${type}</h3>`))
      .addTo(map.current);

    marker.current.on('dragend', async () => {
      if (marker.current) {

        const lngLat = marker.current.getLngLat();
        onDragEnd({ lat: lngLat.lat, lon: lngLat.lng });

        // Reverse geocode to get the name/address
        // const response = await fetch(
        //   `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lngLat.lat}&lon=${lngLat.lng}`
        // );
        // const data = await response.json();
        // const displayName = data.display_name || 'Unknown location';
        // console.log(`Marker dragged to: ${displayName}`);

        // Now you have both coordinates and the name
        // if(type === 'Origin') {

        // }
        // if(type === 'Destination') {
        // }
        // setShouldFetch(true)

        if(type === 'Origin'){
          if (routes.length > 0 && routes[0].fromStationName !== originInputText) {
            setOriginInputText(routes[0].fromStationName);
          }
          else {
            async function fetchname() {
            if ( lngLat.lat && lngLat.lng) {
              const placeName = await reverseNominatim(lngLat.lat, lngLat.lng);
              if (placeName) {
                setOriginInputText(placeName);
              }
            }
          }
          fetchname()
        }
      }
        if(type === 'Destination') {
          async function fetchname() {
            if ( lngLat.lat && lngLat.lng) {
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

  // useEffect(() => {
  //   if (
  //     origin
  //     &&
  //     destination
  //     // && 
  //     // shouldFetch
  //   ) {
  //     console.log(`Origin: ${origin.lat}, ${origin.lon} | Destination: ${destination.lat}, ${destination.lon}`);
  //     fetchRoutes();
  //     setShouldFetch(false);
  //   } else {
  //     console.log("no origin or destination", origin, destination)
  //   }
  // }, [
  //   origin,
  //   destination
  //   // shouldFetch,
  // ]);



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

  // useEffect(() => {
  //   if(origin && destination) {
  //     setShouldFetch(true)
  //   }
  // }, [origin,destination]);


  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
    />
  );
};

export default MapLibre;