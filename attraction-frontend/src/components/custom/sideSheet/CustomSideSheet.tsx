'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Navigation, Search, Menu, User, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


interface CustomSidesheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    width?: number;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    position?: 'left' | 'right'; // Position of the sidesheet
    overlay?: boolean; // Whether to show an overlay behind the sidesheet
    resizable?: boolean; // Whether the sidesheet is resizable
}


// Reusable Sidesheet Component
const CustomSidesheet = ({ 
  isOpen, 
  onClose, 
  width = 400,
  children,
  className = "",
  position = "left", // "left" or "right"
  overlay = false,
  resizable = false
}: CustomSidesheetProps ) => {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Resizing logic
interface MouseDownEvent extends React.MouseEvent<HTMLDivElement, MouseEvent> {}

const handleMouseDown = (e: MouseDownEvent): void => {
    if (!resizable) return;
    setIsResizing(true);
    e.preventDefault();
};

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent): void => {
        const newWidth = position === 'left' ? e.clientX : window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= 800) {
            setCurrentWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position]);

  const sidePosition = position === 'left' ? 'left-0' : 'right-0';
  const translateClass = position === 'left' 
    ? (isOpen ? 'translate-x-0' : '-translate-x-full')
    : (isOpen ? 'translate-x-0' : 'translate-x-full');

  return (
    <>
      {/* Optional Overlay */}
      {overlay && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 z-20 ${
            isOpen ? 'opacity-20' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
      )}

      {/* Sidesheet */}
      <div
        className={`fixed top-0 ${sidePosition} h-full bg-white shadow-xl transition-transform duration-300 ease-out z-50 flex flex-col ${translateClass} ${className}`}
        style={{ width: currentWidth, maxWidth: '80vw' }}
      >


          {children}

        {/* Resize Handle */}
        {resizable && (
          <div
            className={`absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors ${
              isResizing ? 'bg-blue-500' : 'bg-transparent'
            }`}
            onMouseDown={handleMouseDown}
          />
        )}
      </div>
    </>
  );
};




type HeaderProps = {
    onClose: () => void;
    showCloseButton?: boolean;
    children?: React.ReactNode;
    className?: string;
}

const Header = ({onClose, showCloseButton, children,className }: HeaderProps) => {
  return (
    <>
            {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b bg-white",className)}>
          {children}
          {showCloseButton && (
              <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
              aria-label="Close"
              >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
    </>
  )
}


type ContentProps = {
    children: React.ReactNode;
    className?: string;
}

const Content = ({className, children}: ContentProps) => {
  return (
    <>
            {/* Content */}
        <div className={cn('flex-1 overflow-y-auto mb-10', className)}>
          {children}
        </div>
    </>
  )
}


type FooterProps = {
    children?: React.ReactNode;
    className?: string;
};

const Footer = ({ children, className }: FooterProps) => {
    return (
        <div className={cn('p-4 border-t bg-white', className)}>
            {children}
        </div>
    );
};



export {
    CustomSidesheet,
    Header,
    Content,
    Footer
}