import { useCustomSideSheetStore } from '@/store/customSideSheet';
import React from 'react'
import { Content, CustomSidesheet, Header } from './CustomSideSheet';
import { SidebarTrigger } from '../../ui/sidebar';
import { MenuIcon } from 'lucide-react';
import DirectionsContent from './DirectionsContent';
import { SavedContent } from './SavedContent';
import ProfileContent from './ProfileContent';
import SettingsContent from './SettingsContent';
import TripHistoryContent from './TripHistoryContent';
import Logo from '@/components/logo'

type Props = {
    handleRouteSelect: (index: number) => void;
}

const SideSheets = ({handleRouteSelect}: Props) => {

    const { isSideSheetOpen,currentContent,setCurrentContent, setSideSheetClose, setSideSheetOpen } = useCustomSideSheetStore();

    const getSideSheetContent = () =>{
        switch (currentContent) {
            case 'directions':
                return <DirectionsContent handleRouteSelect={handleRouteSelect} />;
            case 'trip-history':
                return <TripHistoryContent/>
            case 'saved-locations':
                return <SavedContent/>
            case 'profile':
                return <ProfileContent/>
            case 'settings':
                return <SettingsContent/>
            
    }}



    return (
        <span className="">
        <CustomSidesheet
            isOpen={isSideSheetOpen}
            onClose={setSideSheetClose}
            title="Trip Planner"
            width={400}
            showCloseButton={true}
            position="left"
            overlay={false}
            resizable={true}
            className=''
        >
            <Header
                onClose={setSideSheetClose}
                showCloseButton={true}
                className=''
            >
                <SidebarTrigger>
                    <MenuIcon className="h-6 w-6 text-gray-600" />
                </SidebarTrigger>
                <Logo/>
                {/* <h2 className="text-lg font-semibold text-gray-800 truncate">Trip Planner</h2> */}
            </Header>
            <Content
                // className='overflow-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                className='scrollbar-hide'
            >
                {getSideSheetContent()}
            </Content>
        </CustomSidesheet>
        </span>
    )
}

export default SideSheets