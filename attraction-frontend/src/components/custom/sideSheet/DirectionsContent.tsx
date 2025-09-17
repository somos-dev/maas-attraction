"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import JourneyDetails from '../../JourneyDetails'
import { Button } from '../../ui/button'
import SearchBar from '../../SearchBar'
import RoutesList from '../../RoutesList'
import { useLocationStore } from '@/store/locationStore';
import { useRoutesStore } from '@/store/routesStore'
import { Search, X } from 'lucide-react'
import { usePanelStore } from '@/store/panelStore'
import { Separator } from '@radix-ui/react-select'
import useLocales from '@/hooks/useLocales'

type Props = {
  handleRouteSelect: (index: number) => void
}

// Bottom Sheet Heights
const BOTTOM_SHEET_HEIGHTS = {
  COLLAPSED: 120,
  PARTIAL: 400,
  EXPANDED: window.innerHeight * 0.85
};

const DirectionsContent = ({ handleRouteSelect }: Props) => {
  const { translate } = useLocales();

  const { routes, selectedRouteIndex } = useRoutesStore()
  const { isPanelOpen, isDetailsOpen, togglePanel, setDetailsClose } = usePanelStore()
  const { origin, destination } = useLocationStore();


  const selectedRoute = useMemo(() => {
    return routes[selectedRouteIndex] || null;
  }, [routes, selectedRouteIndex]);



  return (
    <div
    className='w-full'
    >
      <div
      >
        <div className="bg-white">
          {/* Handle bar for dragging */}
            <Separator className="w-full bg-gray-300 rounded-full" />

          {/* Panel Toggel */}
          <div className={`transition-all duration-300`}>
            <div className="pb-2">
              {/* {isDetailsOpen ? ( */}
              <div className={`px-2 ${isDetailsOpen ? '' : 'hidden'} pt-2`}>
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-lg font-semibold">{String(translate('directions.routeDetails'))}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={setDetailsClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <JourneyDetails selectedRoute={selectedRoute} />
              </div>
              {/* ) : ( */}
              <span className={`${isDetailsOpen ? 'hidden' : ''}`}>
                <SearchBar />

                {routes.length > 0 && (
                  <div className="mt-4 px-2">
                    <RoutesList
                      onRouteSelect={handleRouteSelect}
                    />
                  </div>
                )}

                {/* Empty state when no routes */}
                {routes.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <div className="mb-2">
                      <Search className="h-8 w-8 mx-auto text-gray-300" />
                    </div>
                    <p className="text-sm">
                      {!origin && !destination
                        ? String(translate('directions.setStartingPointAndDestination'))
                        : !origin
                          ? String(translate('directions.addOriginToFindRoutes'))
                          : !destination
                            ? String(translate('directions.addDestinationToFindRoutes'))
                            : String(translate('directions.noRoutesFound'))
                      }
                    </p>
                  </div>
                )}
              </span>
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectionsContent