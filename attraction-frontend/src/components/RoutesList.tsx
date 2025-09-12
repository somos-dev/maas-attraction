"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Bike, Bus, Car, Navigation, Clock, MapPin, Zap } from 'lucide-react';
import { Route } from '@/app/api/plan-trip/route';

// Using the actual store hook from props
const { useRoutesStore } = require('@/store/routesStore') || (() => ({ selectedRouteIndex: 0, routes: [] }));

interface RoutesListProps {
  onRouteSelect: (index: number) => void;
}

const RoutesList: React.FC<RoutesListProps> = ({ onRouteSelect }) => { 
  const { selectedRouteIndex, routes } = useRoutesStore();
  
  if (routes.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">No routes found</h3>
        <p className="text-gray-500">Please search for a destination to see available routes.</p>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const formatDistance = (km: number) => {
    return km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'walk':
        return <Navigation className="h-5 w-5" />;
      case 'bicycle':
        return <Bike className="h-5 w-5" />;
      case 'scooter':
        return <Zap className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'other':
        return <Car className="h-5 w-5" />;
      default:
        return <Navigation className="h-5 w-5" />;
    }
  };

  const getTransportModeIcon = (mode: string) => {
    switch (mode) {
      case 'walk':
        return "🚶";
      case 'bicycle':
        return "🚴";
      case 'scooter':
        return "🛴";
      case 'bus':
        return "🚌";
      case 'other':
        return "🚗";
      default:
        return "🚶";
    }
  };

  const getModeConfig = (mode: string) => {
    switch (mode) {
      case 'walk':
        return {
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          accentColor: 'bg-blue-300',
          lightAccent: 'bg-emerald-100'
        };
      case 'bicycle':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          accentColor: 'bg-blue-500',
          lightAccent: 'bg-blue-100'
        };
      case 'bus':
        return {
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          accentColor: 'bg-orange-500',
          lightAccent: 'bg-orange-100'
        };
      case 'scooter':
        return {
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          accentColor: 'bg-purple-500',
          lightAccent: 'bg-purple-100'
        };
      case 'other':
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          accentColor: 'bg-gray-500',
          lightAccent: 'bg-gray-100'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          accentColor: 'bg-gray-500',
          lightAccent: 'bg-gray-100'
        };
    }
  };

  // All possible tabs
  const allTabs = [
    { id: 'all', label: 'All Routes', icon: '🎯' },
    { id: 'bus', label: 'Bus', icon: '🚌' },
    { id: 'walk', label: 'Walking', icon: '🚶' },
    { id: 'bicycle', label: 'Bicycle', icon: '🚴' },
    { id: 'scooter', label: 'Scooter', icon: '🛴' },
    { id: 'other', label: 'Other', icon: '🚗' }
  ];

  const getRouteCount = (mode: string) => {
    const count = mode === 'all' ? routes.length : routes.filter((r: Route) => r.mode === mode).length;
    return count;
  };

  const getBestRoute = (routeList: any[]) => {
    if (routeList.length === 0) return null;
    return routeList.reduce((best, current) => 
      current.duration < best.duration ? current : best
    );
  };

  const renderRouteCard = (route : Route, originalIndex : number, isBest = false) => {
    const isSelected = selectedRouteIndex === originalIndex;
    const config = getModeConfig(route.mode);
    
    return (
      <Card
        key={route.id}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-200 group  ${isBest ? 'pb-0 pt-1' : 'p-0' }
          ${isSelected 
            ? `border-2 border-blue-500 shadow-lg bg-blue-50` 
            : 'border border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
          }
        `}
        onClick={() => onRouteSelect(originalIndex)}
      >
        {/* Best route badge */}
        {isBest && (
          <div className="absolute top-1 right-2 bg-blue-200 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            ⚡ Fastest
          </div>
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-200`} />
        )}

        <div className="p-4">
          {/* Header section */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border`}>
                <div className={config.textColor}>
                  {getModeIcon(route.mode)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {route.mode.charAt(0).toUpperCase() + route.mode.slice(1)}
                  </h3>
                  {route.steps.find(step => step.type === 'bus' && step.start_time) && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full`}>
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {new Date(
                          route.steps.find(step => step.type === 'bus' && step.start_time)!.start_time
                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
                {route.distance && (
                  <p className="text-sm text-gray-500 mt-1">
                    Distance: {formatDistance(route.distance)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`
                px-2 py-1 rounded-lg font-bold text-lg text-black
                 
              `}>
                {formatTime(route.duration)}
              </div>
            </div>
          </div>

          {/* Journey steps */}
          {route.steps.length > 1 && (
            <div className=" flex flex-row items-center gap-2 text-gray-500">
              <p className="text-xs font-medium mt-1">JOURNEY STEPS</p>
              <div className="flex items-center flex-wrap">
                {route.steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-1 rounded-full">
                      <span className="text-sm">{getTransportModeIcon(step.type)}</span>
                      {/* <span className="text-xs text-gray-600 font-medium">
                        {step?.duration && step.duration}
                      </span> */}
                    </div>
                    {idx < route.steps.length - 1 && (
                      // <ArrowRight className="w-3 h-3 text-gray-400" />
                      '>'
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
          
          {/* Route details */}
          <div className="border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-900"> <i>{route.fromStationName}</i> <ArrowRight className='w-4 h-4 inline-block'/> <i>{route.toStationName}</i></p>
          </div>
        </div>
      </Card>
    );
  };

  const filterRoutes = (mode: string) => {
    return mode === 'all' ? routes : routes.filter((r: Route) => r.mode === mode);
  };

  const renderEmptyState = (mode: string) => (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl opacity-50">
          {allTabs.find(tab => tab.id === mode)?.icon || '🚫'}
        </span>
      </div>
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        No routes available for {mode === 'all' ? 'any transport type' : mode}
      </h3>
      <p className="text-gray-500 text-sm">
        Try searching for a different destination or check back later.
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="all" className="w-full">
        {/* Enhanced Tab Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <TabsList className="grid w-full grid-cols-6 bg-gray-50 gap-0 h-auto p-0">
            {allTabs.map((tab) => {
              const count = getRouteCount(tab.id);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="
                    relative flex flex-col items-center gap-1 px-2 py-1 text-gray-600 
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 
                    data-[state=active]:shadow-sm border-r border-gray-200 last:border-r-0
                    hover:bg-white/50 transition-all duration-200
                  "
                >
                  {count > 0 && (
                    <span className="absolute top-0 right-0 bg-blue-200 text-black text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {count}
                    </span>
                  )}
                  
                  <span className={`text-lg ${count > 0 && 'mr-2'}`}>{tab.icon}</span>
                  {/* <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                  <span className="text-xs sm:hidden font-medium">
                    {tab.label.split(' ')[0]}
                  </span> */}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Contents */}
        {allTabs.map((tab) => {
          const filteredRoutes = filterRoutes(tab.id);
            interface SortedRoute extends Route {}
            const sortedRoutes: SortedRoute[] = filteredRoutes.slice().sort((a: Route, b: Route) => a.duration - b.duration);
          const bestRoute = getBestRoute(sortedRoutes);
          
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4 mt-0">
              {filteredRoutes.length > 0 ? (
                <div className="space-y-4">
                  {/* Route count header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} found
                    </h2>
                    <span className="text-sm text-gray-500">
                      Sorted by duration
                    </span>
                  </div>
                  
                  {/* Routes list */}
                  <div className="space-y-3">
                    {sortedRoutes.map((route : Route) => {
                        const originalIndex: number = routes.findIndex((r: Route) => r.id === route.id);
                      const isBest = bestRoute && route.id === bestRoute.id && filteredRoutes.length > 1;
                      return renderRouteCard(route, originalIndex, isBest);
                    })}
                  </div>
                </div>
              ) : (
                renderEmptyState(tab.id)
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default RoutesList;