// src/context/MapContext.tsx
import React, { createContext, useContext, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

type MapContextType = {
  map: React.MutableRefObject<maplibregl.Map | null>;
  userMarker: React.MutableRefObject<maplibregl.Marker | null>;  
  originMarker: React.MutableRefObject<maplibregl.Marker | null>;  
  destinationMarker: React.MutableRefObject<maplibregl.Marker | null>; 
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const originMarker = useRef<maplibregl.Marker | null>(null);
  const destinationMarker = useRef<maplibregl.Marker | null>(null);
  

  return (
    <MapContext.Provider value={{ map, userMarker, originMarker,destinationMarker}}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
};