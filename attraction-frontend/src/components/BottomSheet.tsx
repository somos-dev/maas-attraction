// import React, { useEffect, useMemo, useRef, useState } from 'react'
// import JourneyDetails from './JourneyDetails'
// import { Button } from './ui/button'
// import SearchBar from './SearchBar'
// import RoutesList from './RoutesList'
// import { useRoutesStore } from '@/store/routesStore'
// import { Navigation, Search, X } from 'lucide-react'
// import { usePanelStore } from '@/store/panelStore'
// import { useLocationStore } from '@/store/locationStore'
// import DirectionsContent from './custom/sideSheet/DirectionsContent'
// import { SavedContent } from './custom/sideSheet/SavedContent'
// import ProfileContent from './custom/sideSheet/ProfileContent'
// import { useCustomSideSheetStore } from '@/store/customSideSheet'

// type Props = {
//   handleRouteSelect: (index: number) => void
// }

// // Bottom Sheet Heights
// const BOTTOM_SHEET_HEIGHTS = {
//   COLLAPSED: 120,
//   PARTIAL: 400,
//   EXPANDED: window.innerHeight * 0.85
// };

// const BottomSheet = ({ handleRouteSelect }: Props) => {
//   // Bottom sheet state
//   const [bottomSheetHeight, setBottomSheetHeight] = useState(BOTTOM_SHEET_HEIGHTS.COLLAPSED);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStartY, setDragStartY] = useState(0);
//   const [dragStartHeight, setDragStartHeight] = useState(0);

//       const { isSideSheetOpen,currentContent,setCurrentContent, setSideSheetClose, setSideSheetOpen } = useCustomSideSheetStore();
  
//       const getSideSheetContent = () =>{
//           switch (currentContent) {
//               case 'directions':
//                   return <DirectionsContent handleRouteSelect={handleRouteSelect} />;
//               case 'saved-locations':
//                   return <SavedContent/>
//               case 'profile':
//                   return <ProfileContent/>
              
//       }}

//   // Refs
//   const bottomSheetRef = useRef(null);
//   const searchContainerRef = useRef(null);

//   const [currentView, setCurrentView] = useState('search');


//   const { routes, selectedRouteIndex } = useRoutesStore()
//   const { isPanelOpen, isDetailsOpen, togglePanel, setDetailsClose } = usePanelStore()
//   const { origin, destination, } = useLocationStore();


//   const selectedRoute = useMemo(() => {
//     return routes[selectedRouteIndex] || null;
//   }, [routes, selectedRouteIndex]);


//   // Bottom sheet drag handlers
//   const handleDragStart = (e) => {
//     const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
//     setIsDragging(true);
//     setDragStartY(clientY);
//     setDragStartHeight(bottomSheetHeight);
//   };

//   const handleDragMove = (e) => {
//     if (!isDragging) return;

//     const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
//     const deltaY = dragStartY - clientY;
//     const newHeight = Math.max(
//       BOTTOM_SHEET_HEIGHTS.COLLAPSED,
//       Math.min(BOTTOM_SHEET_HEIGHTS.EXPANDED, dragStartHeight + deltaY)
//     );

//     setBottomSheetHeight(newHeight);
//   };

//   const handleDragEnd = () => {
//     if (!isDragging) return;

//     setIsDragging(false);

//     // Snap to nearest position
//     const { COLLAPSED, PARTIAL, EXPANDED } = BOTTOM_SHEET_HEIGHTS;

//     if (bottomSheetHeight < (COLLAPSED + PARTIAL) / 2) {
//       setBottomSheetHeight(COLLAPSED);
//     } else if (bottomSheetHeight < (PARTIAL + EXPANDED) / 2) {
//       setBottomSheetHeight(PARTIAL);
//     } else {
//       setBottomSheetHeight(EXPANDED);
//     }
//   };

//   // Add event listeners for drag
//   useEffect(() => {
//     if (isDragging) {
//       const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
//       const handleMouseUp = () => handleDragEnd();
//       const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
//       const handleTouchEnd = () => handleDragEnd();

//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//       document.addEventListener('touchmove', handleTouchMove);
//       document.addEventListener('touchend', handleTouchEnd);

//       return () => {
//         document.removeEventListener('mousemove', handleMouseMove);
//         document.removeEventListener('mouseup', handleMouseUp);
//         document.removeEventListener('touchmove', handleTouchMove);
//         document.removeEventListener('touchend', handleTouchEnd);
//       };
//     }
//   }, [isDragging, handleDragMove, handleDragEnd]);

//   // Handle clicks outside search
//   const isCollapsed = bottomSheetHeight === BOTTOM_SHEET_HEIGHTS.COLLAPSED;
//   const isExpanded = bottomSheetHeight === BOTTOM_SHEET_HEIGHTS.EXPANDED;


//   return (
//     <div
//       className={`absolute z-10  rounded-t-xl rounded-b-sm shadow-lg w-full max-w-[85%] md:w-96 m-4 transition-all duration-300 ease-in-out overflow-y-scroll max-h-[70%] overflow-x-hidden scrollbar-hide ${isPanelOpen ? 'bottom-1' : 'bottom-16'}`}
//       // ref={bottomSheetRef}
//       // className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-30"
//       // style={{
//       //   height: `${bottomSheetHeight}px`,
//       //   maxHeight: '85vh'
//       // }}
//     >
//       {/* Drag Handle */}
//       <div
//         // className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
//         // onMouseDown={handleDragStart}
//         // onTouchStart={handleDragStart}
//       >
//                {/* Collapsed State - Quick Actions */}
//           {/* {isCollapsed && (
//             <div className="px-4 pb-4">
//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   className="flex-1 h-12 justify-start gap-3"
//                   onClick={() => {
//                     setCurrentView('search');
//                     setBottomSheetHeight(BOTTOM_SHEET_HEIGHTS.PARTIAL);
//                   }}
//                 >
//                   <Search className="h-5 w-5" />
//                   Search places
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="h-12 w-12"
//                 >
//                   <Navigation className="h-5 w-5" />
//                 </Button>
//               </div>
//             </div>
//           )} */}

//         <div className="bg-white">
//           {/* Handle bar for dragging */}
//           <div
//             className="h-7 w-full flex justify-center items-center cursor-pointer sticky top-0 bg-gray-100 z-20"
//             onClick={togglePanel}
//           >
//             <div className="w-15 h-1 bg-gray-300 rounded-full"></div>
//           </div>

//           {/* Panel Toggel */}
//           <div className={`transition-all duration-300 ${isPanelOpen ? '' : 'hidden'}`}>
            


//                 {getSideSheetContent()}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BottomSheet