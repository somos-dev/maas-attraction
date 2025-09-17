"use client";
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Check, Smartphone, Monitor } from 'lucide-react';

export default function PWAStatus() {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    notificationPermission,
    requestNotificationPermission 
  } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    console.log('Install result:', success);
  };

  const handleNotificationRequest = async () => {
    const granted = await requestNotificationPermission();
    console.log('Notification permission:', granted);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          PWA Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Installable:</span>
            <span className={`text-sm font-medium ${isInstallable ? 'text-green-600' : 'text-gray-500'}`}>
              {isInstallable ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Installed:</span>
            <span className={`text-sm font-medium ${isInstalled ? 'text-green-600' : 'text-gray-500'}`}>
              {isInstalled ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications:</span>
            <span className={`text-sm font-medium ${
              notificationPermission === 'granted' ? 'text-green-600' : 
              notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {notificationPermission === 'granted' ? '✅ Enabled' : 
               notificationPermission === 'denied' ? '❌ Blocked' : '⚠️ Not Set'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {isInstallable && !isInstalled && (
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}
          
          {isInstalled && (
            <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm text-green-800">App is installed!</span>
            </div>
          )}
          
          {notificationPermission !== 'granted' && (
            <Button onClick={handleNotificationRequest} variant="outline" className="w-full">
              <Monitor className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>• Check browser console for PWA events</p>
          <p>• Install prompt shows after 3 seconds</p>
          <p>• Browser banner is prevented (this is correct)</p>
        </div>
      </CardContent>
    </Card>
  );
}
