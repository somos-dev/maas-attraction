"use client"
import React, { startTransition } from 'react';
import { useRouter } from 'next/navigation';import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MapPin, User, Clock, Settings, Heart, Navigation, SidebarCloseIcon, X } from 'lucide-react';
import { useCustomSideSheetStore } from '@/store/customSideSheet';
import { useSidebarStore } from '@/store/sidebarStore';
import useLocales from '@/hooks/useLocales';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/logo'

interface AppSidebarProps {
}

const AppSidebar: React.FC<AppSidebarProps> = ({  }) => {
  const {setCurrentContent, setSideSheetOpen} = useCustomSideSheetStore()
  const {isSidebarOpen, setSidebarOpen, setSidebarClose} = useSidebarStore()
  const { translate, currentLang, onChangeLang } = useLocales();
  const isMobile = useIsMobile();
  
  const menuItems = [
    {
      title: translate('navigation.savedLocations') || 'Saved Locations',
      icon: MapPin,
      id: "saved-locations"
    },
    {
      title: translate('navigation.tripHistory') || 'Trip History', 
      icon: Clock,
      id: "trip-history"
    },
    // {
    //   title: "Favorites",
    //   icon: Heart,
    //   id: "saved-locations"
    // },
    {
      title: translate('navigation.directions') || 'Directions',
      icon: Navigation,
      id: "directions"
    }
  ];
  const mobileMenuItems = [
    {
      title: translate('navigation.tripHistory') || 'Trip History', 
      icon: Clock,
      id: "trip-history"
    },
  ];

  const accountItems = [
    {
      title: translate('navigation.profile') || 'Profile',
      icon: User,
      id: "profile"
    },
    {
      title: translate('navigation.settings') || 'Settings',
      icon: Settings,
      id: "settings"
    }
  ];

  const router = useRouter()

  

  const onItemClick = (item: string) => {    
    setCurrentContent(item);
    setSidebarClose();
    setSideSheetOpen();
  };


  return (
    <Sidebar className='z-30'>
      <SidebarHeader className='flex flex-row text-center items-center w-full justify-between'>
        <div className="px-4 py-2 flex flex-col items-center w-full">
          <Logo/>
          <div className='h-0.5 bg-gradient-to-r from-blue-500 to-green-600 my-1 w-full'></div>
          <p className="text-sm text-muted-foreground">{translate('navigation.planYourPerfectTrip') || 'Plan your perfect trip'}</p>
        </div>
        <SidebarTrigger>
            <X/>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-muted-foreground'>{translate('navigation.navigation') || 'Navigation'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {
              isMobile ?
              mobileMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => onItemClick(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
              :
              menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => onItemClick(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className='text-muted-foreground'>{translate('account') || 'Account'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => onItemClick(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Language Switcher */}
        <div className="px-4 py-2 flex justify-center">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => onChangeLang('en')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                currentLang.value === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              ENG
            </button>
            <button
              onClick={() => onChangeLang('it')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                currentLang.value === 'it'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              ITA
            </button>
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {translate('common.version') || 'Version'} 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;



