"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Mountain, Satellite, Map, Moon, Navigation, User } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';
import { useMapStore } from '@/store/mapStore';
import AdminControlPanel from './AdminControlPanel';
import useAuth from '@/hooks/useAuth';

interface MapStyleSelectorProps {
}

const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({

}) => {
  const { user } = useAuth();

  const mapStyles = [
    { value: 'streets', label: 'Streets', icon: Map },
    { value: 'satellite', label: 'Satellite', icon: Satellite },
    // { value: 'terrain', label: 'Terrain', icon: Mountain },
    { value: 'osm', label: 'OpenStreetMap', icon: Navigation },
    // { value: 'dark', label: 'Dark', icon: Moon }
  ];
  const {is3D, toggle3D, mapStyle, setMapStyle} = useMapStore()
  const {setProfileOpen} = useProfileStore()

  return (
      <div className="flex flex-row gap-2 items-center max-h-fit">
        <div className="flex items-center gap-2 max-h-fit ">
          <Select value={mapStyle} onValueChange={setMapStyle}>
            <SelectTrigger className="w-full h-10 bg-white">
              <SelectValue placeholder="Map Style" />
            </SelectTrigger>
            <SelectContent>
              {mapStyles.map((style) => {
                const IconComponent = style.icon;
                return (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {style.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant={is3D ? "default" : "outline"}
          size="sm"
          onClick={toggle3D}
          className="w-full max-w-20 hidden sm:inline-block h-9"
        >
          {is3D ? "Exit 3D" : "3D View"}
        </Button>
        <Button
          variant={is3D ? "default" : "outline"}
          size="sm"
          onClick={toggle3D}
          className="w-full max-w-10 sm:hidden h-9"
        >
          {"3D"}
        </Button>

        {/* Admin Control Panel - Only show if user is admin */}
        {user.type === 'admin' &&
        <AdminControlPanel/>}

              {/* Right section - Profile button */}
        {/* <Button
          variant="outline"
          size="icon"
          onClick={setProfileOpen}
          className="bg-blue-300 hover:bg-blue-100 border border-blue-400 hover:border-blue-200 rounded-full shadow transition"
        >
          <User className="h-4 w-4" />
        </Button> */}
      </div>
  );
};

export default MapStyleSelector;
