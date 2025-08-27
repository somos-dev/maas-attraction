"use client";
import { Sheet, SheetRef } from "react-modal-sheet";
import { useState, useRef, useEffect } from "react";
import { Home, User, Settings } from "lucide-react";

const FOOTER_HEIGHT = 64; // px, must match nav bar height
const HEADER_HEIGHT = 56; // px

export default function GoogleMapsBottomSheet() {
  const [isOpen] = useState(true);
  const ref = useRef<SheetRef>(null);

  // Responsive snap points, always above the footer
  const [snapPoints, setSnapPoints] = useState<number[]>([]);
  useEffect(() => {
    const updateSnapPoints = () => {
      const vh = window.innerHeight;
      setSnapPoints([
        vh * 0.9 - FOOTER_HEIGHT,
        vh * 0.6 - FOOTER_HEIGHT,
        vh * 0.3 - FOOTER_HEIGHT,
        HEADER_HEIGHT // only header visible, above footer
      ]);
    };
    updateSnapPoints();
    window.addEventListener("resize", updateSnapPoints);
    return () => window.removeEventListener("resize", updateSnapPoints);
  }, []);

  // Header (handle + title)
  const Header = () => (
    <div className="flex items-center justify-center h-14 bg-white border-b relative rounded-t-2xl">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded bg-gray-300"></div>
      <span className="font-semibold text-base text-center w-full">Explore</span>
    </div>
  );

  // The main sheet
  return (
    <>
      {/* Sheet */}
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => {}}
        snapPoints={snapPoints}
        initialSnap={1}
        disableDrag={false}
        detent="content-height"
      >
        <Sheet.Container
          className="!fixed !left-0 !right-0"
          style={{ bottom: FOOTER_HEIGHT }}
        >
          <Sheet.Content>
            <Header />
            <div className="overflow-y-auto p-4 min-h-[60vh]">
              <h2 className="font-semibold text-lg">Dynamic Google Maps Sheet</h2>
              <p>
                This is the content area. Drag the sheet up and down, and see how the header and footer always stay visible—just like Google Maps!
              </p>
              {/* Add as much content here as needed for scrolling */}
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
      {/* Fixed Footer Navigation Bar */}
      <nav className="fixed left-0 right-0 bottom-0 z-50 h-16 bg-white border-t flex items-center justify-around">
        <button className="flex flex-col items-center text-gray-600">
          <Home size={20} />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <User size={20} />
          <span className="text-xs">Profile</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <Settings size={20} />
          <span className="text-xs">Settings</span>
        </button>
      </nav>
    </>
  );
}
