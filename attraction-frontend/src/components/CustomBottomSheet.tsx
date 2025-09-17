import { useEffect, useState, ReactNode, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Home, Settings, User } from "lucide-react";
import BottomSheetFooter from "./BottomSheetFooter";


export default function CustomBottomSheet({
  children,
  title,
  collapsedHeight = 120,
}: {
  children: ReactNode;
  title?: string;
  /** Height (px) that stays visible when collapsed */
  collapsedHeight?: number;
}) {
  const y = useMotionValue(0);
  const [vh, setVh] = useState<number>(0);

  // ------------- helpers ------------- //
  const refreshViewport = useCallback(() => {
    const h = window.innerHeight;
    setVh(h);
  }, []);

  
  useEffect(() => {
    refreshViewport();
    window.addEventListener("resize", refreshViewport);
    return () => window.removeEventListener("resize", refreshViewport);
  }, [refreshViewport]);

  // set initial position once we know the viewport height
  useEffect(() => {
    if (!vh) return;
    y.set(vh - collapsedHeight);
  }, [vh, collapsedHeight, y]);

  if (!vh) return null; // Render nothing on SSR / before mount

  // Snap point calculations (px from *top* of viewport)
  const FULL = 16; // leave a tiny gutter at the top so users perceive it can be dragged
  const MID = vh * 0.4;
  const COLLAPSED = vh - collapsedHeight;
  const snapPoints = [FULL, MID, COLLAPSED];

  const closestPoint = (val: number) =>
    snapPoints.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );

  const handleDragEnd = () => {
    const currentY = y.get();
    const destination = closestPoint(currentY);
    animate(y, destination, {
      type: "spring",
      bounce: 0.25,
    });
  };

  return (
    <div>

      <motion.div
        drag="y"
        dragElastic={0.2}
        dragConstraints={{ top: FULL, bottom: COLLAPSED }}
        style={{ y }}
        onDragEnd={handleDragEnd}
        className="z-30 fixed left-0 top-0 w-full h-full touch-pan-y pointer-events-none"
      >
        <div
          className="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl pointer-events-auto flex flex-col"
          style={{ height: vh }}
        >
          {/* drag handle */}
          <div className="w-full flex justify-center py-2">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>

          {/* optional title / headline kept visible in collapsed state */}
          {title && (
            <h2 className="text-lg font-semibold px-4 pb-3 border-b border-gray-100">
              {title}
            </h2>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-25 space-y-6">
            {children}
          </div>
        </div>
      </motion.div>
      {/*Footer Navigation Bar */}
      <BottomSheetFooter />
    </div>
  );
}
