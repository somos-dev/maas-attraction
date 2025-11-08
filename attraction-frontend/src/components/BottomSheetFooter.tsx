import { useCustomSideSheetStore } from "@/store/customSideSheet";
import { Home, Settings, User, Bookmark, UserCog } from "lucide-react";
import useLocales from "@/hooks/useLocales";
import useAuth from "@/hooks/useAuth";

type Props = {}

const BottomSheetFooter = (props: Props) => {
    const {setBottomSheetContent } = useCustomSideSheetStore();
    const { translate } = useLocales();
    const { user } = useAuth();

    const tabs = [
        { icon: <Home size={20} />, label: translate('navigation.directions') || 'Directions', id: 'directions' },
        { icon: <Bookmark size={20} />, label: translate('navigation.savedLocations') || 'Saved', id: 'saved-locations' },
    ];

    const adminTabs = [
        { icon: <Home size={20} />, label: translate('navigation.directions') || 'Directions', id: 'directions' },
        { icon: <Bookmark size={20} />, label: translate('navigation.savedLocations') || 'Saved', id: 'saved-locations' },
        { icon: <UserCog size={20} />, label: 'Administrator', id: 'Administrator' },
    ];

    const onItemClick = (item: string) => {
        setBottomSheetContent(item);
    };
    return (
        <nav className="fixed left-0 right-0 bottom-0 z-40 h-16 bg-white border-t flex items-center justify-around">
            {
                user.type === 'admin' ?
                (adminTabs.map((tab, index) => (
                    <button 
                    onClick={() => onItemClick(tab.id)}
                    key={index} className="flex flex-col items-center text-gray-600">
                        {tab.icon}
                        <span className="text-xs">{tab.label}</span>
                    </button>
                )))
                :
                (tabs.map((tab, index) => (
                    <button 
                    onClick={() => onItemClick(tab.id)}
                    key={index} className="flex flex-col items-center text-gray-600">
                        {tab.icon}
                        <span className="text-xs">{tab.label}</span>
                    </button>
                )))
            }
        </nav>

    )
}

export default BottomSheetFooter