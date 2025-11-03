import React, { use, useEffect } from 'react'
import CustomBottomSheet from './CustomBottomSheet'
import DirectionsContent from './custom/sideSheet/DirectionsContent'
import { SavedContent } from './custom/sideSheet/SavedContent'
import ProfileContent from './custom/sideSheet/ProfileContent'
import SettingsContent from './custom/sideSheet/SettingsContent'
import { useCustomSideSheetStore } from '@/store/customSideSheet'
import RandomContent from './RandomContent'
import { useLocationStore } from '@/store/locationStore'
import useLocales from '@/hooks/useLocales'
import AdminControlPanelContent from './custom/sideSheet/AdminControlPanelContent'

type Props = {
    handleRouteSelect: (index: number) => void
}


const MobileBottomSheet = ({ handleRouteSelect }: Props) => {

    const {userLocationName} = useLocationStore()
    const { currentBottomSheetContent } = useCustomSideSheetStore();
    const { translate } = useLocales();
    
    useEffect(() => {
        console.log("Mobile Bottom Sheet Opened:", userLocationName);
    }, [userLocationName]);

    const getBottomSheetContent = () => {
        switch (currentBottomSheetContent) {
            case 'directions':
                return <DirectionsContent handleRouteSelect={handleRouteSelect} />;
            case 'saved-locations':
                return <SavedContent />
            default:
                return <AdminControlPanelContent />

        }
    }




    return (
        <CustomBottomSheet title={`${userLocationName ? userLocationName : translate('common.currentLocation') || 'Current Location'}`}>
            {getBottomSheetContent()} 
        </CustomBottomSheet>
    )
}

export default MobileBottomSheet