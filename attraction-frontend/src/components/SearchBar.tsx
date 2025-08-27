"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, X, Loader2, Search } from 'lucide-react';
import { useMap } from "@/context/MapContext";
import { reverseNominatim, useNominatimSearch } from '@/hooks/use-nomination'; // Assuming this hook exists and works
import { useLocationStore } from '@/store/locationStore';
import DateTimePicker from './DateTimePicker';
import { toast } from 'sonner'; // Assuming you use sonner for toasts
import { useRoutesStore } from '@/store/routesStore'; // Assuming this store exists
import Hint from './hint'; // Assuming this component exists
import { useStopsStore } from '@/store/stopsStore'; // Assuming this store exists
import { usePanelStore } from '@/store/panelStore';
import { useFetchRoutesStore } from '@/store/fetchRoutesStore';
import { useFetchRoutes } from '@/hooks/use-fetch-routes';
import { useInputStateStore } from '@/store/inputsStateStore';
import { set } from 'date-fns';
import { useShouldFetchStore } from '@/store/shouldFetchStore';
import useLocales from '@/hooks/useLocales';


interface SearchBarProps {
}

const DEBOUNCE_DELAY = 400; // Debounce for Nominatim search and store updates

// Define the Stop type as it comes from your useStopsStore
interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type?: string; // e.g., 'bus_stop', 'train_station'
  address?: string;
  description?: string;
}



const SearchBar: React.FC<SearchBarProps> = ({ }) => {
  // const {originInputText, setDestInputText, setOriginInputText, destInputText} = useInputStateStore()
  const { translate } = useLocales();

  const formRef = useRef<HTMLFormElement>(null)
  // Local UI state
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [originActiveIdx, setOriginActiveIdx] = useState(-1);
  const [destActiveIdx, setDestActiveIdx] = useState(-1);

  // Refs for click-outside detection
  const originContainerRef = useRef<HTMLDivElement>(null);
  const destinationContainerRef = useRef<HTMLDivElement>(null);
  const { selectedDate, selectedTime, setSelectedDate, setSelectedTime, travelMode, travelType, setTravelMode, setTravelType } = useFetchRoutesStore()



  // Zustand Store Interactions
  const { routes, setRoutes, setSelectedRouteIndex } = useRoutesStore();
  const {
    origin, originName, setOriginName, setOrigin,
    destination, destinationName, setDestinationName, setDestination,
  } = useLocationStore();
  const { map, originMarker, destinationMarker } = useMap(); // MapRef and markerRefs
  const { stops } = useStopsStore(); // RawStop[] from useStopsStore
  const { originInputText, setDestInputText, setOriginInputText, destInputText } = useInputStateStore()
  const {shouldFetch, toggleShouldFetch ,setShouldFetch} = useShouldFetchStore()

  // Local state for debounced queries for Nominatim and filtered stops
  const [debouncedOriginQuery, setDebouncedOriginQuery] = useState('');
  const [debouncedDestQuery, setDebouncedDestQuery] = useState('');
  const [filteredOriginStops, setFilteredOriginStops] = useState<Stop[]>([]);
  const [filteredDestStops, setFilteredDestStops] = useState<Stop[]>([]);

  // Nominatim Search Hook
  const { results: originNomResults, isNomLoading: isOriginNomLoading } = useNominatimSearch(debouncedOriginQuery);
  const { results: destNomResults, isNomLoading: isDestNomLoading } = useNominatimSearch(debouncedDestQuery);

  const { fetchRoutes, isLoadingRoutes, error } = useFetchRoutes()
  // Set initial input text from store on mount
  useEffect(() => {
    if (originName) setOriginInputText(originName);
    if (destinationName) setDestInputText(destinationName);
  }, []); // Run once on mount

  // Update local input text if originName/destinationName changes from external sources (e.g., map click)
  // useEffect(() => {
  //   if (routes.length > 0 && routes[0].fromStationName !== originInputText) {
  //     setOriginInputText(routes[0].fromStationName);
  //   }
  //   else {
  //     async function fetchname() {
  //       if (origin && origin.lat && origin.lon) {
  //         const placeName = await reverseNominatim(origin.lat, origin.lon);
  //         if (placeName) {
  //           setOriginInputText(placeName);
  //         }
  //       }
  //     }
  //     fetchname()
  //   }
  // }, [origin]);

  // useEffect(() => {
  //   if (routes.length > 0 && routes[0].toStationName !== destInputText) {
  //     setDestInputText(routes[0].toStationName);
  //   } 
  //   else {
  //     async function fetchname() {
  //       if (destination && destination.lat && destination.lon) {
  //         const placeName = await reverseNominatim(destination.lat, destination.lon);
  //         if (placeName) {
  //           setDestInputText(placeName);
  //         }
  //       }
  //     }
  //     fetchname()
  //   }
  // }, [destination]);


  useEffect(() => {
    console.log(origin, destination)
  }, [origin, destination])

  // --- Debouncing and Search Logic ---

  // Debounce origin input for Nominatim and store update
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOriginQuery(originInputText);
      // Only update the store after debounce for performance
      if (originInputText !== originName) {
        setOriginName(originInputText);
      }
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [originInputText, setOriginName]); // Added setOriginName to dependencies for safety

  // Debounce destination input for Nominatim and store update
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDestQuery(destInputText);
      // Only update the store after debounce for performance
      if (destInputText !== destinationName) {
        setDestinationName(destInputText);
      }
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [destInputText, setDestinationName]); // Added setDestinationName to dependencies for safety

  // Filter local stops based on debounced query
  useEffect(() => {
    if (debouncedOriginQuery.length > 2) { // Minimum 3 characters to search stops
      if (!Array.isArray(stops)) {
        setFilteredOriginStops([]);
        return;
      }
      const results = stops?.filter((stop: Stop) =>
        stop?.name.toLowerCase().includes(debouncedOriginQuery.toLowerCase())
      );
      setFilteredOriginStops(results);
    } else {
      setFilteredOriginStops([]);
    }
  }, [debouncedOriginQuery, stops]);

  useEffect(() => {
    if (debouncedDestQuery.length > 2) { // Minimum 3 characters to search stops
      if (!Array.isArray(stops)) {
        setFilteredDestStops([]);
        return;
      }
      const results = stops?.filter((stop: Stop) =>
        stop?.name.toLowerCase().includes(debouncedDestQuery.toLowerCase())
      );
      setFilteredDestStops(results);
    } else {
      setFilteredDestStops([]);
    }
  }, [debouncedDestQuery, stops]);


  // --- UI Interaction Handlers ---

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originContainerRef.current && !originContainerRef.current.contains(event.target as Node)) {
        setShowOriginResults(false);
      }
      if (destinationContainerRef.current && !destinationContainerRef.current.contains(event.target as Node)) {
        setShowDestinationResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for origin results
  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const combinedResults = [...originNomResults, ...filteredOriginStops];
    if (!showOriginResults || !combinedResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor movement in input
      setOriginActiveIdx((prev) => Math.min(prev + 1, combinedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor movement in input
      setOriginActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && originActiveIdx >= 0) {
      e.preventDefault(); // Prevent form submission
      const r = combinedResults[originActiveIdx];
      // Distinguish between Nominatim result and Stop result
      if ('place_id' in r) { // Type guard for Nominatim results
        selectOriginNominatimResult(r);
      } else { // Assume it's a Stop result
        selectOriginStopResult(r as Stop);
      }
    }
  };

  // Keyboard navigation for destination results
  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const combinedResults = [...destNomResults, ...filteredDestStops];
    if (!showDestinationResults || !combinedResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestActiveIdx((prev) => Math.min(prev + 1, combinedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && destActiveIdx >= 0) {
      e.preventDefault();
      const r = combinedResults[destActiveIdx];
      if ('place_id' in r) {
        selectDestNominatimResult(r);
      } else {
        selectDestStopResult(r as Stop);
      }
    }
  };

  // Select result helpers
  const selectOriginNominatimResult = useCallback((r: any) => {
    setOrigin({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    setOriginName(r.display_name); // Update store
    setOriginInputText(r.display_name); // Update local input state
    setShowOriginResults(false);
    setOriginActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [parseFloat(r.lon), parseFloat(r.lat)], zoom: 13 });
  }, [map, setOrigin, setOriginName]);

  const selectOriginStopResult = useCallback((r: Stop) => {
    setOrigin({ lat: r.lat, lon: r.lon });
    setOriginName(r.name); // Update store
    setOriginInputText(r.name); // Update local input state
    setShowOriginResults(false);
    setOriginActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [r.lon, r.lat], zoom: 13 });
  }, [map, setOrigin, setOriginName]);


  const selectDestNominatimResult = useCallback((r: any) => {
    setDestination({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    setDestinationName(r.display_name); // Update store
    setDestInputText(r.display_name); // Update local input state
    setShowDestinationResults(false);
    setDestActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [parseFloat(r.lon), parseFloat(r.lat)], zoom: 13 });
    setShouldFetch(true)
  }, [map, setDestination, setDestinationName]);

  const selectDestStopResult = useCallback((r: Stop) => {
    setDestination({ lat: r.lat, lon: r.lon });
    setDestinationName(r.name); // Update store
    setDestInputText(r.name); // Update local input state
    setShowDestinationResults(false);
    setDestActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [r.lon, r.lat], zoom: 13 });
      // setShouldFetch(true)
  }, [map, setDestination, setDestinationName]);


  // Clear input handlers
  const clearOriginInput = useCallback(() => {
    setOriginInputText('');
    setOriginName(''); // Clear store
    setOrigin(null);
    setShowOriginResults(false);
    setOriginActiveIdx(-1);
    setSelectedRouteIndex(0); // Reset selected route if any
    setRoutes([]); // Clear routes
    originMarker.current?.remove(); // Remove marker if exists
    originMarker.current = null;
  }, [setOriginInputText, setOriginName, setOrigin, setSelectedRouteIndex, setRoutes, originMarker]);

  const clearDestInput = useCallback(() => {
    setDestInputText('');
    setDestinationName(''); // Clear store
    setDestination(null);
    setShowDestinationResults(false);
    setDestActiveIdx(-1);
    setSelectedRouteIndex(0); // Reset selected route if any
    setRoutes([]); // Clear routes
    destinationMarker.current?.remove(); // Remove marker if exists
    destinationMarker.current = null;
  }, [setDestInputText, setDestinationName, setDestination, setSelectedRouteIndex, setRoutes, destinationMarker]);

  // Use Current Location
  const handleUseCurrentLocation = useCallback(() => {
    if (!map.current) {
      toast.error(String(translate("toast.mapNotLoaded")));
      return;
    }

    // Attempt to get current location using geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newOrigin = { lat: latitude, lon: longitude };
        setOrigin(newOrigin);
        setOriginName(String(translate("common.currentLocation"))); // Set a generic name
        setOriginInputText(String(translate("common.currentLocation")));
        map.current?.flyTo({ center: [longitude, latitude], zoom: 13 });
        toast.success(String(translate("toast.currentLocationSet")));
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(String(translate("toast.currentLocationError")));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [map, setOrigin, setOriginName, setOriginInputText, translate]);


  // Highlight matched text in search results
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 rounded px-1">{part}</span>
      ) : (
        part
      )
    );
  }, []);


  const combinedOriginResults = [...originNomResults, ...filteredOriginStops];
  const combinedDestResults = [...destNomResults, ...filteredDestStops];



  return (
    <div
      className="w-full mt-3 bg-transparent border-none rounded-lg shadow-lg"

    // className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-30"
    // style={{
    //   height: `${bottomSheetHeight}px`,
    //   maxHeight: '85vh'
    // }}
    // ref={bottomSheetRef}
    >
      <form onSubmit={(e) => {
        e.preventDefault()
        fetchRoutes()
      }} ref={formRef} className="space-y-3 px-2 pb-2">
        {/* Origin Input */}
        <div className="flex items-center space-x-2 relative" ref={originContainerRef}>
          <div className="flex-1 relative">
            <Input
              type="text"
              id='origin'
              name='origin'
              placeholder={String(translate("search.startingPoint"))}
              value={originInputText}
              onChange={e => {
                setOriginInputText(e.target.value);
                setShowOriginResults(true);
                setOriginActiveIdx(-1);
              }}
              onFocus={() => setShowOriginResults(true)}
              onKeyDown={handleOriginKeyDown}
              className="w-full pr-8"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showOriginResults}
              aria-controls="origin-results"
            />
            {(originInputText || origin) && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={clearOriginInput}
                tabIndex={-1}
                aria-label={String(translate("search.clearOriginInput"))}
              >
                <X size={16} />
              </button>
            )}
            {showOriginResults && (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg scrollbar-thin scrollbar-thumb-blue-100">
                {isOriginNomLoading && debouncedOriginQuery.length > 0 ? (
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <Loader2 className="animate-spin mr-2" size={18} /> Searching...
                  </div>
                ) : combinedOriginResults.length === 0 && debouncedOriginQuery.length > 0 ? (
                  <div className="px-4 py-4 text-gray-500 text-center text-sm">
                    No results found for "{originInputText}".
                  </div>
                ) : (
                  <>
                    {originNomResults.length > 0 && (
                      <div className="w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 rounded-t-xl">{String(translate("search.addresses"))}</div>
                    )}
                    {originNomResults.map((r, idx) => (
                      <button
                        type="button"
                        key={`nom-org-${idx}`}
                        className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${originActiveIdx === idx ? 'bg-blue-100' : ''}`}
                        onClick={() => selectOriginNominatimResult(r)}
                        aria-selected={originActiveIdx === idx}
                        role="option"
                      >
                        <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.display_name, originInputText)}</span>
                          {r.type && (<span className="text-xs text-gray-500 capitalize mt-0.5">{r.type.replace(/_/g, ' ')}</span>)}
                        </span>
                      </button>
                    ))}

                    {filteredOriginStops.length > 0 && (
                      <div className={`w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ${originNomResults.length > 0 ? 'border-t border-gray-200' : 'rounded-t-xl'}`}>{String(translate("search.busStops"))}</div>
                    )}
                    {filteredOriginStops.map((r, idx) => (
                      <button
                        type="button"
                        key={`stop-org-${idx}`}
                        className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${originActiveIdx === (originNomResults.length + idx) ? 'bg-blue-100' : ''}`}
                        onClick={() => selectOriginStopResult(r)}
                        aria-selected={originActiveIdx === (originNomResults.length + idx)}
                        role="option"
                      >
                        <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.name, originInputText)}</span>
                          <span className="text-xs text-gray-500 capitalize mt-0.5">{String(translate("search.busStop"))}</span>
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <Hint description={String(translate('search.useCurrentLocation'))} side='bottom' className='border-black p-3'>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              onClick={handleUseCurrentLocation}
              aria-label={String(translate('search.useCurrentLocation'))}
            >
              <Navigation className="h-5 w-5" />
            </Button>
          </Hint>
        </div>

        {/* Destination Input */}
        <div className="relative" ref={destinationContainerRef}>
          <Input
            type="text"
            id='destination'
            name='destination'
            placeholder={String(translate("search.whereTo"))}
            value={destInputText}
            onChange={e => {
              setDestInputText(e.target.value);
              setShowDestinationResults(true);
              setDestActiveIdx(-1);
            }}
            onFocus={() => setShowDestinationResults(true)}
            onKeyDown={handleDestKeyDown}
            className="w-full pr-8"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showDestinationResults}
            aria-controls="dest-results"
          />
          {(destInputText || destination) && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={clearDestInput}
              tabIndex={-1}
              aria-label={String(translate("search.clearDestinationInput"))}
            >
              <X size={16} />
            </button>
          )}
          {/* Results Dropdown */}
          {showDestinationResults && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg scrollbar-thin scrollbar-thumb-blue-100">
              {isDestNomLoading && debouncedDestQuery.length > 0 ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <Loader2 className="animate-spin mr-2" size={18} /> {String(translate("common.searching"))}
                </div>
              ) : combinedDestResults.length === 0 && debouncedDestQuery.length > 0 ? (
                <div className="px-4 py-4 text-gray-500 text-center text-sm">
                  {String(translate("search.noResultsFor"))} "{destInputText}".
                </div>
              ) : (
                <>
                  {destNomResults.length > 0 && (
                    <div className="w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 rounded-t-xl">{String(translate("search.addresses"))}</div>
                  )}
                  {destNomResults.map((r, idx) => (
                    <button
                      type="button"
                      key={`nom-dest-${idx}`}
                      className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${destActiveIdx === idx ? 'bg-blue-100' : ''}`}
                      onClick={() => selectDestNominatimResult(r)}
                      aria-selected={destActiveIdx === idx}
                      role="option"
                    >
                      <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                      <span className="flex flex-col">
                        <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.display_name, destInputText)}</span>
                        {r.type && (<span className="text-xs text-gray-500 capitalize mt-0.5">{r.type.replace(/_/g, ' ')}</span>)}
                      </span>
                    </button>
                  ))}

                  {filteredDestStops.length > 0 && (
                    <div className={`w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ${destNomResults.length > 0 ? 'border-t border-gray-200' : 'rounded-t-xl'}`}>{String(translate("search.busStops"))}</div>
                  )}
                  {filteredDestStops.map((r, idx) => (
                    <button
                      type="button"
                      key={`stop-dest-${idx}`}
                      className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${destActiveIdx === (destNomResults.length + idx) ? 'bg-blue-100' : ''}`}
                      onClick={() => selectDestStopResult(r)}
                      aria-selected={destActiveIdx === (destNomResults.length + idx)}
                      role="option"
                    >
                      <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                      <span className="flex flex-col">
                        <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.name, destInputText)}</span>
                        <span className="text-xs text-gray-500 capitalize mt-0.5">{String(translate("search.busStop"))}</span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* DateTimePicker and Travel Mode */}
        <DateTimePicker />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isLoadingRoutes || !destination} // Disable if loading or no destination
        >
          {isLoadingRoutes ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={18} /> {String(translate("common.searching"))}
            </span>
          ) : String(translate("search.findRoutes"))}
        </Button>
      </form>
    </div>
  );
};

export default React.memo(SearchBar);