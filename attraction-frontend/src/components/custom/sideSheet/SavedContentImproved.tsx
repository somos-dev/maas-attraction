import { ArrowLeft, Briefcase, ChevronRight, Heart, Home, MapPin, MoreVertical, Star, Trash2, Utensils, Building, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useDeleteLocationMutation, useGetLocationsQuery, selectLocationTypes, getLocationTypeConfig, type Location } from "@/redux/services/savedApi";
import { toast } from "sonner";
import AddPlaceDialog from "./AddPlaceDialog";
import { useSetDirections } from "@/hooks/use-set-directions";

// Icon mapping for dynamic rendering
const iconMap = {
  Home,
  Briefcase,
  MapPin,
  Heart,
  Star,
  Utensils,
  Building,
  ShoppingBag,
};

export interface LocationGroup {
  type: string;
  count: number;
  locations: Location[];
  config: {
    icon: string;
    color: string;
    description: string;
  };
}

export const SavedContent = () => {
  const [currentView, setCurrentView] = useState<'lists' | 'list-detail'>('lists');
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);

  const { data: locations = [], isSuccess, isError, error, isLoading } = useGetLocationsQuery();
  const { setDirections } = useSetDirections();
  const [deleteLocation] = useDeleteLocationMutation();

  // Get dynamic location groups
  const locationGroups = selectLocationTypes(locations);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Data loaded successfully', {
        duration: 3000,
      });
    }

    if (isError) {
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && error !== null) {
        if ('status' in error && 'data' in error) {
          errorMessage = typeof error.data === 'string'
            ? error.data
            : (typeof error.data === 'object' && error.data !== null && 'message' in error.data)
              ? (error.data as any).message
              : JSON.stringify(error.data);
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      toast.error(`Error loading data: ${errorMessage}`, {
        duration: 3000,
      });
    }
  }, [isError, isSuccess, error]);

  const handleRemovePlace = async (locationId: number) => {
    try {
      await deleteLocation(locationId).unwrap();
      toast.success('Location removed successfully');
    } catch (error) {
      toast.error('Failed to remove location');
    }
  };

  const handleAddPlace = () => {
    // This will be handled by the AddPlaceDialog mutation
    toast.success('Location added successfully');
  };

  const handleGroupClick = (group: LocationGroup) => {
    setSelectedGroup(group);
    setCurrentView('list-detail');
  };

  const handleBackToLists = () => {
    setCurrentView('lists');
    setSelectedGroup(null);
  };

  const handleDirectionsClick = (location: Location) => {
    console.log('directions destination', location);
    setDirections({
      destination: {
        lat: location.latitude || location.lat || 0,
        lon: location.longitude || location.lon || 0,
        name: location.address
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Detail view for a specific location type
  if (currentView === 'list-detail' && selectedGroup) {
    const IconComponent = iconMap[selectedGroup.config.icon as keyof typeof iconMap] || MapPin;
    
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLists}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <IconComponent className={`w-5 h-5 ${selectedGroup.config.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 capitalize">{selectedGroup.type}</h3>
              <p className="text-sm text-gray-600">{selectedGroup.count} places</p>
            </div>
          </div>
          <AddPlaceDialog
            listName={selectedGroup.type}
            onAddPlace={handleAddPlace}
          />
        </div>

        <div className="space-y-2">
          {selectedGroup.locations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No places in this list yet</p>
                <p className="text-sm text-gray-400 mb-4">Add your first place to get started</p>
                <AddPlaceDialog
                  listName={selectedGroup.type}
                  onAddPlace={handleAddPlace}
                />
              </CardContent>
            </Card>
          ) : (
            selectedGroup.locations.map((location) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 capitalize">{location.type}</div>
                        <div className="text-sm text-gray-600">{location.address}</div>
                        <div className="text-xs text-gray-400">
                          {location.latitude && location.longitude && 
                            `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => handleDirectionsClick(location)} 
                        variant="outline" 
                        size="sm"
                      >
                        Directions
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <span className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900">
                            <AddPlaceDialog
                              listName={selectedGroup.type}
                              onAddPlace={handleAddPlace}
                              isEditing={true}
                              placeId={location.id}
                              editAddress={location.address}
                              placeCoords={{
                                lat: location.latitude || location.lat || 0,
                                lon: location.longitude || location.lon || 0
                              }}
                            />
                          </span>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemovePlace(location.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main lists view
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Your Lists</h3>
        <Badge variant="secondary">{locationGroups.length} types</Badge>
      </div>

      <div className="space-y-3">
        {locationGroups.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No saved locations yet</p>
              <p className="text-sm text-gray-400 mb-4">Add your first location to get started</p>
              <AddPlaceDialog
                listName="favorites"
                onAddPlace={handleAddPlace}
              />
            </CardContent>
          </Card>
        ) : (
          locationGroups.map((group) => {
            const IconComponent = iconMap[group.config.icon as keyof typeof iconMap] || MapPin;
            return (
              <Card
                key={group.type}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGroupClick(group)}
              >
                <CardContent className="px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className={`w-5 h-5 ${group.config.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 capitalize">{group.type}</div>
                        <div className="text-sm text-gray-600">
                          {group.count} place{group.count !== 1 ? 's' : ''}
                          {group.config.description && ` • ${group.config.description}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
