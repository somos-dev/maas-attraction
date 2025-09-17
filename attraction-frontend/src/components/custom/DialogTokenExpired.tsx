"use client"
import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { PATH_AUTH } from '@/routes/paths';
import useLocales from '../../hooks/useLocales';
import {  usePathname } from 'next/navigation';

export default function DialogTokenExpired() {
  const authModal = useAuthModal();
  const { translate } = useLocales();
  const [countdown, setCountdown] = useState(30);
  const pathname = usePathname()
  const handleDialogClose = useCallback(() => {
    authModal.onClose();
    // Use router if available, otherwise fallback to window.location
    if (typeof window !== 'undefined' && pathname !== PATH_AUTH.login) {
      window.location.href = PATH_AUTH.login;
    }
  }, [authModal]);

  // Countdown and auto-redirect
  useEffect(() => {
    if (!authModal.isOpen) {
      setCountdown(30); // Reset countdown when dialog closes
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleDialogClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [authModal.isOpen, handleDialogClose]);

  // Handle escape key
  useEffect(() => {
    if (!authModal.isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDialogClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [authModal.isOpen, handleDialogClose]);

  if (!authModal.isOpen) return null;

  return (
    <Dialog 
      open={authModal.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-md"
        style={{ 
          alignItems: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          padding: '2rem' 
        }}
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          {/* Title */}
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {String(translate('Session Expired'))}
          </DialogTitle>
          
          {/* Message */}
          <Card className="p-4 w-full bg-red-50 border-red-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              {String(translate('Your session has expired. Please log in again to continue.'))}
            </p>
          </Card>
          
          {/* Countdown notice */}
          <p className="text-xs text-gray-500">
            {String(translate(`You will be redirected to login automatically in ${countdown} seconds`))}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            size="lg"
            variant="default"
            onClick={handleDialogClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            {String(translate('Login Again'))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}