"use client"
import { useState, useEffect, use } from 'react';
import MapLibre from '@/components/MapLibre';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import ProfileDialog from '@/components/ProfileDialog';
import { useLocationStore } from '@/store/locationStore';
import { useTripManagerStore } from '@/store/tripStore';
import MapNavbar from '@/components/MapNavbar';
import { useRoutesStore } from '@/store/routesStore';
import { usePanelStore } from '@/store/panelStore';
import { useIsMobile } from '@/hooks/use-mobile';
import SideSheets from '@/components/custom/sideSheet/SideSheets';
import { useSidebarStore } from '@/store/sidebarStore';
import { Provider } from 'react-redux';
import { store } from '@/redux/store/store';
import { useProfileStore } from '@/store/profileStore';
import MobileBottomSheet from '@/components/MobileBottomSheet';
import { reverseNominatim } from '@/hooks/use-nomination';

interface PageProps {
}


const Page = ({ }: PageProps) => {
  const { origin, setOrigin, destination, setDestination, userLocation, setUserLocation, setUserLocationName } = useLocationStore();
  const { routes, setSelectedRouteIndex } = useRoutesStore()

  const { currentTrip, setCurrentTrip } = useTripManagerStore()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarStore()
  const { isProfileOpen } = useProfileStore()
  const isMobile = useIsMobile();


  const {setDetailsOpen, setPanelOpen } = usePanelStore()


  useEffect(() => {
    console.log("Profile", isProfileOpen)
  }, [isProfileOpen])


  // Get user's location on initial load
  useEffect(() => {
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Don't show error to user as it's optional
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [userLocation, setUserLocation]);

  useEffect(() => {
    async function getUserLocationName() {
      if (userLocation) {
        const locName = await reverseNominatim(userLocation.lat, userLocation.lon)
        console.log("User Location Name:", locName);
        setUserLocationName(locName as string);
      }
    }
    getUserLocationName();
  }, [userLocation, setUserLocationName])


  const handleMapClick = (lat: number, lon: number) => {
    if (!origin) {
      setOrigin({ lat, lon });
    } else if (!destination) {
      setDestination({ lat, lon });

      if (origin) {
        const originRoute: [number, number] = [origin.lat, origin.lon]
        // const newRoutes = generateMockRoutes(originRoute, [lat, lon]);
        // setRoutes(newRoutes);
        setSelectedRouteIndex(0);
        setPanelOpen();
      }
    }
  };

  const handleRouteSelect = (index: number) => {
    setSelectedRouteIndex(index);
    setDetailsOpen();

    // Update current trip with selected route
    if (currentTrip && routes[index]) {
      setCurrentTrip({
        ...currentTrip,
        selectedRoute: routes[index]
      });
    }
  };



  return (
    <SidebarProvider
      open={isSidebarOpen} onOpenChange={setIsSidebarOpen}
    >
      <Provider store={store}>
        <AppSidebar />
        {/* Side Sheet */}
        {/* <SideSheets
      handleRouteSelect={handleRouteSelect}
      /> */}

        <SideSheets
          handleRouteSelect={handleRouteSelect}
        />

        {/* Main layout */}
        <div className="min-h-screen flex w-full bg-gray-50">
          <div className="flex-1 relative max-h-screen overflow-hidden">
            {/* Map container */}
            <div className="absolute inset-0">
              <MapLibre
                onMapClick={handleMapClick}
              />
            </div>

            {/* Map Navbar */}
            <MapNavbar />

            {/* Search and routes panel */}
            {/* {isMobile &&
              <span className="">
                <BottomSheet
                  handleRouteSelect={handleRouteSelect}
                />
              </span>
            } */}


            {isMobile &&
              <span className="">
                <MobileBottomSheet
                  handleRouteSelect={handleRouteSelect}
                />
              </span>
            }

          </div>
          {/* Profile Dialog */}
          <ProfileDialog />
        </div>
      </Provider>
    </SidebarProvider>
  );
};

export default Page;
