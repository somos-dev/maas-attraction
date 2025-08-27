"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      console.log('PWA: Install prompt will show in 3 seconds...');
      // Show prompt after a delay
      const timer = setTimeout(() => {
        console.log('PWA: Showing custom install prompt now!');
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      console.log('PWA Install Prompt Status:', {
        isInstallable,
        isInstalled,
        isDismissed,
        willShow: isInstallable && !isInstalled && !isDismissed
      });
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="border border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Install Attraction
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Install our app for a better experience with offline access and notifications.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstall}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Install
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                >
                  Not now
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-blue-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
