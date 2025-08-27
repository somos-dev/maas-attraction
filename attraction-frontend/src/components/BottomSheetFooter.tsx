import { useCustomSideSheetStore } from "@/store/customSideSheet";
import { Home, Settings, User, Bookmark } from "lucide-react";
import useLocales from "@/hooks/useLocales";

type Props = {}

const BottomSheetFooter = (props: Props) => {
    const { isSideSheetOpen, currentContent, setCurrentContent, setBottomSheetContent, setSideSheetClose, setSideSheetOpen } = useCustomSideSheetStore();
    const { translate } = useLocales();

    const tabs = [
        { icon: <Home size={20} />, label: translate('navigation.directions') || 'Directions', id: 'directions' },
        { icon: <Bookmark size={20} />, label: translate('navigation.savedLocations') || 'Saved', id: 'saved-locations' },
    ];

    const onItemClick = (item: string) => {
        setBottomSheetContent(item);
    };
    return (
        <nav className="fixed left-0 right-0 bottom-0 z-40 h-16 bg-white border-t flex items-center justify-around">
            {
                tabs.map((tab, index) => (
                    <button 
                    onClick={() => onItemClick(tab.id)}
                    key={index} className="flex flex-col items-center text-gray-600">
                        {tab.icon}
                        <span className="text-xs">{tab.label}</span>
                    </button>
                ))
            }
        </nav>

    )
}

export default BottomSheetFooter