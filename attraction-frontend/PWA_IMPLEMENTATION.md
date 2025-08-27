# PWA Implementation Guide

This document explains the Progressive Web App (PWA) features implemented in the Attraction application.

## Features Implemented

### 1. App Installation
- **Install Prompt**: Automatically shows install prompt after 3 seconds on supported browsers
- **Install Button**: Reusable component (`PWAInstallButton`) for manual installation
- **Installation Detection**: Detects if app is already installed

### 2. Service Worker & Caching
- **Cache Strategy**: Cache-first strategy for better performance
- **Offline Support**: Serves cached content when offline
- **Background Sync**: Updates cache in the background
- **Static Asset Caching**: Caches essential assets on install

### 3. Push Notifications
- **Real-time Notifications**: Integrates with existing SSE notifications
- **Browser Notifications**: Shows native browser notifications
- **Permission Management**: Handles notification permission requests
- **Push Subscription**: VAPID-based push notification support

### 4. Offline Experience
- **Offline Page**: Custom offline page with retry functionality
- **Connection Detection**: Monitors online/offline status
- **Graceful Degradation**: App continues to work with cached data

## Files Added/Modified

### New Files
```
public/
├── sw.js                           # Service worker
├── manifest.json                   # PWA manifest (updated)
└── browserconfig.xml               # Windows tile configuration

src/
├── app/offline/page.tsx            # Offline page
├── hooks/use-pwa.ts                # PWA hook
├── components/
│   ├── InstallPrompt.tsx           # Auto install prompt
│   ├── PWAInstallButton.tsx        # Manual install button
│   └── PWANotificationSettings.tsx # Notification settings
└── .env.example                    # Environment variables example
```

### Modified Files
```
src/
├── app/layout.tsx                  # Added PWA metadata
├── app/(platform)/layout.tsx       # Added InstallPrompt component
└── hooks/useLiveNotifications.ts   # Added PWA notification support
```

## Setup Instructions

### 1. Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### 2. Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 3. Icon Files
Generate proper PWA icons in these sizes and place in `public/icons/`:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### 4. Testing
1. **Development**: Run `npm run dev` and test on mobile devices
2. **Production**: Deploy and test install prompt on HTTPS
3. **Offline**: Disconnect internet and verify offline functionality
4. **Notifications**: Test notification permission and display

## Usage Examples

### Install Button
```tsx
import PWAInstallButton from '@/components/PWAInstallButton';

function Header() {
  return (
    <div>
      <PWAInstallButton variant="outline" size="sm" />
    </div>
  );
}
```

### Notification Settings
```tsx
import PWANotificationSettings from '@/components/PWANotificationSettings';

function SettingsPage() {
  return (
    <div>
      <PWANotificationSettings />
    </div>
  );
}
```

### PWA Hook
```tsx
import { usePWA } from '@/hooks/use-pwa';

function MyComponent() {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    notificationPermission,
    requestNotificationPermission 
  } = usePWA();

  return (
    <div>
      {isInstallable && (
        <button onClick={installApp}>Install App</button>
      )}
    </div>
  );
}
```

## Browser Support

### Installation
- Chrome/Edge (Android/Desktop)
- Safari (iOS 16.4+)
- Firefox (limited support)

### Push Notifications
- Chrome/Edge (full support)
- Safari (macOS/iOS with limitations)
- Firefox (desktop only)

### Service Worker
- All modern browsers

## Performance Benefits

1. **Faster Loading**: Cache-first strategy reduces load times
2. **Offline Access**: Core functionality available without internet
3. **Reduced Data Usage**: Cached resources don't re-download
4. **Native Feel**: App-like experience on mobile devices

## Security Considerations

1. **HTTPS Required**: PWA features require HTTPS in production
2. **VAPID Keys**: Keep private keys secure and rotate regularly
3. **Permissions**: Request permissions responsibly
4. **Content Security Policy**: Ensure CSP allows service worker

## Troubleshooting

### Install Prompt Not Showing
1. Verify HTTPS is enabled
2. Check manifest.json is valid
3. Ensure service worker registers successfully
4. Clear browser cache and storage

### Notifications Not Working
1. Check permission status
2. Verify VAPID keys are correct
3. Test in supported browsers
4. Check console for errors

### Offline Page Not Loading
1. Verify service worker is registered
2. Check cache strategy in sw.js
3. Ensure offline.html is cached
4. Test fetch event handling

## Next Steps

1. **Analytics**: Track PWA install rates and usage
2. **Background Sync**: Implement for form submissions
3. **Update Strategy**: Handle app updates gracefully
4. **Performance**: Monitor cache hit rates and optimize
5. **Testing**: Add automated PWA testing
