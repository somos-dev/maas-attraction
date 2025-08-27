"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { toast } from 'sonner';

export default function PWANotificationSettings() {
  const { 
    notificationPermission, 
    requestNotificationPermission, 
    subscribeToPushNotifications 
  } = usePWA();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled) {
      // Can't programmatically disable notifications, user needs to do it in browser
      toast.info('To disable notifications, please use your browser settings');
      return;
    }

    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        await subscribeToPushNotifications();
        toast.success('Notifications enabled successfully!');
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { icon: Check, text: 'Notifications enabled', color: 'text-green-600' };
      case 'denied':
        return { icon: X, text: 'Notifications blocked', color: 'text-red-600' };
      default:
        return { icon: Bell, text: 'Notifications not requested', color: 'text-gray-600' };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about important updates and travel information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <span className={`text-sm ${status.color}`}>
              {status.text}
            </span>
          </div>
          <Switch
            checked={notificationPermission === 'granted'}
            onCheckedChange={handleNotificationToggle}
            disabled={isLoading || notificationPermission === 'denied'}
          />
        </div>

        {notificationPermission === 'default' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Enable notifications to receive real-time updates about your trips and important alerts.
            </p>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-2">
              Notifications are blocked. To enable them:
            </p>
            <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Change notifications from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        {notificationPermission === 'granted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if ('Notification' in window) {
                new Notification('Test Notification', {
                  body: 'Your notifications are working correctly!',
                  icon: '/logo.png',
                });
              }
            }}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
