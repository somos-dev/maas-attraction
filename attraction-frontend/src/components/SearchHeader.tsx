"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, MenuIcon, User, X, Loader2 } from 'lucide-react';
import { SidebarTrigger } from './ui/sidebar';
import { useMap } from '@/context/MapContext';
import { useNominatimSearch } from '@/hooks/use-nomination';
import { useLocationStore } from '@/store/locationStore';
import { useProfileStore } from '@/store/profileStore';
import { useStopsStore } from '@/store/stopsStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePanelStore } from '@/store/panelStore';
import { useSidesheet } from '@/hooks/use-custom-sidesheet';
import { set } from 'date-fns';
import { useCustomSideSheetStore } from '@/store/customSideSheet';
import { FaDirections } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import useLocales from '@/hooks/useLocales';


interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type?: string; // e.g., 'bus_stop', 'train_station'
  address?: string;
  description?: string;
}

interface SearchHeaderProps {
}

const DEBOUNCE_DELAY = 400;

const SearchHeader: React.FC<SearchHeaderProps> = ({ }) => {
  const { togglePanel, setDetailsOpen, setPanelOpen } = usePanelStore()
  const isMobile = useIsMobile();
  const { translate } = useLocales();

  const {
    setSearchLocation,
    setSearchLocationName,
    searchLocationName,
    searchLocation, // Added searchLocation to dependencies where needed
  } = useLocationStore();

  // Local state for the input field (immediate UI feedback)
  const [searchInputText, setSearchInputText] = useState('');

  // Local UI state for search results dropdown
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchActiveIdx, setSearchActiveIdx] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced query for Nominatim API and stop filtering
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Loading state for the search results (combining Nominatim and local stop search)
  const [isSearching, setIsSearching] = useState(false); // Renamed for clarity

  // Zustand Store / Context interactions
  const { setProfileOpen } = useProfileStore();
  const { map } = useMap();
  const { stops } = useStopsStore();

  // Results from hooks and local filtering
  const { results: nominatimResults, isNomLoading: isNominatimLoading } = useNominatimSearch(debouncedSearchQuery);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);

  const { isSideSheetOpen, setCurrentContent, setSideSheetOpen } = useCustomSideSheetStore();
  const router = useRouter()
  const handleSideSheetOpen = () => {
    setSideSheetOpen();
    setCurrentContent('directions');
    // router.push('/tripplanner/directions', { scroll: false });
  }

  // Set initial input text from store on mount
  useEffect(() => {
    if (searchLocationName) setSearchInputText(searchLocationName);
  }, [searchLocationName]); // Depend on searchLocationName to pick up external changes

  // Debounce searchInputText for Nominatim API calls and local stop filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInputText);
    }, DEBOUNCE_DELAY);

    // Set loading immediately when typing starts
    setIsSearching(true);

    return () => {
      clearTimeout(handler);
      // If a new keystroke occurs before debounce, cancel the previous loading indicator.
      // This is slightly more complex, but generally, showing loading on new input is fine.
    };
  }, [searchInputText]); // Dependency is searchInputText, as we want to debounce changes to it.

  // When debounced query changes, and Nominatim search or stop filtering is complete, turn off loading.
  useEffect(() => {
    // Only set loading to false if both Nomatim and local search are done for the current debounced query
    if (!isNominatimLoading && debouncedSearchQuery === searchInputText) {
      setIsSearching(false);
    }
  }, [isNominatimLoading, debouncedSearchQuery, searchInputText]);

  // Filter local stops based on debounced query
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) { // Minimum 3 characters to search stops
      const results = stops.filter((stop: Stop) =>
        stop?.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredStops(results);
    } else {
      setFilteredStops([]);
    }
  }, [debouncedSearchQuery, stops]);


  // --- UI Interaction Handlers ---

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation for search results
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const combinedResults = [...nominatimResults, ...filteredStops]; // Renamed for clarity
    if (!showSearchResults || !combinedResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor movement in input
      setSearchActiveIdx((prev) => Math.min(prev + 1, combinedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor movement in input
      setSearchActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchActiveIdx >= 0) {
      e.preventDefault(); // Prevent form submission
      const selectedItem = combinedResults[searchActiveIdx];
      // Type guard to distinguish Nominatim results from Stop results
      if ('place_id' in selectedItem) {
        selectSearchNomiResult(selectedItem);
      } else {
        selectSearchStopResult(selectedItem as Stop);
      }
    }
  };

  // Select result helpers - now also update searchInputText directly
  const selectSearchNomiResult = useCallback((r: any) => {
    setSearchLocation({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    setSearchLocationName(r.display_name); // Update store
    setSearchInputText(r.display_name); // Update local input state immediately
    setShowSearchResults(false);
    setSearchActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [parseFloat(r.lon), parseFloat(r.lat)], zoom: 15 });
  }, [map, setSearchLocation, setSearchLocationName]);

  const selectSearchStopResult = useCallback((r: Stop) => {
    setSearchLocation({ lat: r.lat, lon: r.lon });
    setSearchLocationName(r.name); // Update store
    setSearchInputText(r.name); // Update local input state immediately
    setShowSearchResults(false);
    setSearchActiveIdx(-1);
    if (map.current) map.current.flyTo({ center: [r.lon, r.lat], zoom: 15 });
  }, [map, setSearchLocation, setSearchLocationName]);

  // Clear input handler
  const clearSearchInput = useCallback(() => {
    setSearchInputText('');
    setSearchLocationName(''); // Clear store
    setSearchLocation(null);
    setShowSearchResults(false);
    setSearchActiveIdx(-1);
  }, [setSearchInputText, setSearchLocationName, setSearchLocation]);

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

  const combinedSearchResults = [...nominatimResults, ...filteredStops];

  return (
    <div className={`z-20 flex items-center gap-3 px-2 bg-transparent rounded-xl ${isSideSheetOpen && !isMobile ? "hidden" : ""}`}>
      {/* Sidebar toggle */}
      <SidebarTrigger className="h-10 w-10 bg-white rounded-full shadow hover:bg-blue-50 transition">
        <MenuIcon />
      </SidebarTrigger>

      {/* Search bar */}
      <div className="flex-1 max-w-lg">
        <form className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 z-20" />
            <Input
              type="text"
              placeholder={String(translate("search.searchPlaces"))}
              value={searchInputText}
              onChange={e => {
                setSearchInputText(e.target.value);
                setShowSearchResults(true);
                setSearchActiveIdx(-1);
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-2xl shadow focus:ring-2 focus:ring-blue-300 transition text-base h-10"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search for places"
            />
            {(searchInputText || searchLocation) && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={clearSearchInput}
                tabIndex={-1}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
            {showSearchResults && (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg scrollbar-thin scrollbar-thumb-blue-100">
                {isSearching && debouncedSearchQuery.length > 0 ? ( // Use combined isSearching state
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <Loader2 className="animate-spin mr-2" size={18} /> {String(translate("common.searching"))}
                  </div>
                ) : combinedSearchResults.length === 0 && debouncedSearchQuery.length > 0 ? (
                  <div className="px-4 py-4 text-gray-500 text-center text-sm">
                    {String(translate("search.noResultsFor"))} "{searchInputText}".
                  </div>
                ) : (
                  <>
                    {nominatimResults.length > 0 && (
                      <div className="w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 rounded-t-xl">{String(translate("search.addresses"))}</div>
                    )}
                    {nominatimResults.map((r, idx) => (
                      <button
                        type="button"
                        key={`nom-search-${idx}`} // Unique key
                        className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${searchActiveIdx === idx ? 'bg-blue-100' : ''}`}
                        onClick={() => selectSearchNomiResult(r)}
                        aria-selected={searchActiveIdx === idx}
                        role="option"
                      >
                        <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.display_name, searchInputText)}</span>
                          {r.type && (<span className="text-xs text-gray-500 capitalize mt-0.5">{r.type.replace(/_/g, ' ')}</span>)}
                        </span>
                      </button>
                    ))}

                    {filteredStops.length > 0 && (
                      <div className={`w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ${nominatimResults.length > 0 ? 'border-t border-gray-200' : 'rounded-t-xl'}`}>{String(translate("search.busStops"))}</div>
                    )}
                    {filteredStops.map((r, idx) => (
                      <button
                        type="button"
                        key={`stop-search-${nominatimResults.length + idx}`} // Unique key
                        className={`w-full text-left flex items-start gap-2 px-4 py-3 hover:bg-blue-50 focus:bg-blue-100 transition-colors border-b last:border-b-0 border-gray-100 ${searchActiveIdx === (nominatimResults.length + idx) ? 'bg-blue-100' : ''}`}
                        onClick={() => selectSearchStopResult(r)}
                        aria-selected={searchActiveIdx === (nominatimResults.length + idx)}
                        role="option"
                      >
                        <span className="flex-shrink-0 mt-1"><Search className="h-4 w-4 text-blue-400" /></span>
                        <span className="flex flex-col">
                          <span className="font-medium text-gray-800 leading-tight">{highlightMatch(r.name, searchInputText)}</span>
                          <span className="text-xs text-gray-500 capitalize mt-0.5">{String(translate("search.busStop"))}</span>
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
            {
              !isMobile
              &&
              <button
                type="button"
                onClick={handleSideSheetOpen}
                className="absolute right-1 top-1/7"
                title="Plan a trip"
              >
                <FaDirections className='w-7 h-7 text-blue-700 hover:text-red-500 border-none rounded-full shadow transition' />
              </button>
            }
            {/* <button
            type="button"
            onClick={togglePanel}
            className="sm:hidden absolute right-1 top-1/7"
            title="Plan a trip"
          >
            <FaDirections className='w-7 h-7 text-blue-700 hover:text-red-500 border-none rounded-full shadow transition' />
          </button> */}

          </div>
        </form>
      </div>

      {/* Profile button */}
      <Button
        variant="outline"
        size="icon"
        onClick={setProfileOpen}
        className="bg-gradient-to-tr from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 border-none rounded-full shadow transition"
        title={String(translate("labels.openProfile"))}
      >
        <User className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
};

export default SearchHeader;