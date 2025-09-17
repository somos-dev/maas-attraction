import { Edit, Loader2, MapPin, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import type { Place } from "../../../@types/savedList";
import { useCreateLocationMutation, useUpdateLocationMutation } from "@/redux/services/savedApi";
import { useNominatimSearch } from "@/hooks/use-nomination";
import { useStopsStore } from "@/store/stopsStore";
import { useLocationStore } from "@/store/locationStore";
import { useMap } from "@/context/MapContext";
import { toast } from "sonner";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error';
  
  if ('status' in error && 'data' in error) {
    return typeof error.data === 'string'
      ? error.data
      : (typeof error.data === 'object' && error.data !== null && 'message' in error.data)
        ? (error.data as any).message
        : JSON.stringify(error.data);
  } else if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return 'Unknown error';
};


interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type?: string;
  address?: string;
  description?: string;
}

const DEBOUNCE_DELAY = 400;


const AddPlaceDialog = ({ listName, onAddPlace, isEditing = false, placeId, editAddress, placeCoords }: { listName: string; onAddPlace: () => void, isEditing?: boolean, placeId?: number, editAddress?: string, placeCoords?:{lat:number,lon:number} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Local UI state for search results dropdown
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchActiveIdx, setSearchActiveIdx] = useState(-1);

  const { results: nominatimResults, isNomLoading: isNominatimLoading } = useNominatimSearch(debouncedSearchQuery);
  const { stops } = useStopsStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchInputText, setSearchInputText] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { map } = useMap();

  useEffect(() => {
    if (isEditing && editAddress && placeCoords) {
      setSearchInputText(editAddress)
      setSearchLocation({lat:placeCoords.lat, lon:placeCoords.lon})
    }
  }, [])


  const {
    setSearchLocation,
    setSearchLocationName,
    searchLocationName,
    searchLocation,
  } = useLocationStore();

  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInputText);
    }, DEBOUNCE_DELAY);

    setIsSearching(true);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputText]);


  useEffect(() => {
    if (!isNominatimLoading && debouncedSearchQuery === searchInputText) {
      setIsSearching(false);
    }
  }, [isNominatimLoading, debouncedSearchQuery, searchInputText]);


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
    const combinedResults = [...nominatimResults, ...filteredStops];
    if (!showSearchResults || !combinedResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchActiveIdx((prev) => Math.min(prev + 1, combinedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchActiveIdx >= 0) {
      e.preventDefault();
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

  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();
  
  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (placeName.trim() && searchLocation) {
      try {
        console.log(searchInputText, searchLocation, listName);
        if (isEditing && placeId) {
          await updateLocation({
            id: placeId,
            data: {
              address: searchInputText,
              lat: searchLocation.lat,
              lon: searchLocation.lon,
              type: listName.toLowerCase()
            }
          }).unwrap();
          toast.success('Location updated successfully');
        } else {
          console.log('Creating new location with:', {
            address: searchInputText,
            lat: searchLocation.lat,
            lon: searchLocation.lon,
            type: listName.toLowerCase()
          });
          await createLocation({
            address: searchInputText,
            latitude: searchLocation.lat,
            longitude: searchLocation.lon,
            type: listName.toLowerCase()
          }).unwrap();
          toast.success('Location added successfully');
        }

        // Call the onAddPlace callback to notify parent component
        onAddPlace();

        // Reset form and close dialog
        setPlaceName('');
        setPlaceAddress('');
        setSearchInputText('');
        setSearchLocation(null);
        setSearchLocationName('');
        setIsOpen(false);

      } catch (error) {
        console.error('Error saving location:', error);
        const errorMessage = getErrorMessage(error);
        const action = isEditing ? 'update' : 'add';
        toast.error(`Failed to ${action} location: ${errorMessage}`);
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditing ?
          <span className="flex flex-row z-40">
            <Edit className="w-4 h-4 mr-2" />
            Edit Place

          </span>
          :
          <Button size="sm" className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            Add Place
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Place to {listName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="placeName">Place Name</Label>
            <Input
              id="placeName"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Enter place name..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="placeAddress">Address</Label>
            <div className="relative flex-1" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 z-20" />
              <Input
                type="text"
                placeholder="Search for places, addresses, or landmarks..."
                value={searchInputText}
                onChange={e => {
                  setSearchInputText(e.target.value);
                  setShowSearchResults(true);
                  setSearchActiveIdx(-1);
                }}
                onFocus={() => setShowSearchResults(true)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 mt-1"
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
              {showSearchResults && searchInputText && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg scrollbar-thin scrollbar-thumb-blue-100">
                  {isSearching && debouncedSearchQuery.length > 0 ? ( // Use combined isSearching state
                    <div className="flex items-center justify-center py-4 text-gray-500">
                      <Loader2 className="animate-spin mr-2" size={18} /> Searching...
                    </div>
                  ) : combinedSearchResults.length === 0 && debouncedSearchQuery.length > 0 ? (
                    <div className="px-4 py-4 text-gray-500 text-center text-sm">
                      No results found for "{searchInputText}".
                    </div>
                  ) : (
                    <>
                      {nominatimResults.length > 0 && (
                        <div className="w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 rounded-t-xl">Addresses</div>
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
                        <div className={`w-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ${nominatimResults.length > 0 ? 'border-t border-gray-200' : 'rounded-t-xl'}`}>Bus Stops</div>
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
                            <span className="text-xs text-gray-500 capitalize mt-0.5">Bus Stop</span>
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!placeName.trim() || !searchInputText.trim() || isCreating || isUpdating}
          >
            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Place'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaceDialog;