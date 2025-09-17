# Internationalization (i18n) Setup

This project now supports Italian and English translations using `react-i18next`.

## Features Implemented

1. **Language Support**: Italian (default) and English
2. **Settings Component**: Language switcher in the sidebar settings
3. **SSR Compatibility**: Client-side initialization with fallback values
4. **Translations Applied To**:
   - AppSidebar (navigation items, headers)
   - SettingsContent (language switcher and settings options)
   - BottomSheetFooter (navigation labels)
   - MobileBottomSheet (current location text)
   - SavedContent (titles and empty states)

## How to Use Translations

### 1. Import the useLocales hook
```typescript
import useLocales from '@/hooks/useLocales';
```

### 2. Get the translate function
```typescript
const { translate, currentLang, onChangeLang } = useLocales();
```

### 3. Use translations in your components with fallbacks
```typescript
// Simple translation with fallback for SSR compatibility
<h1>{translate('navigation.journeyPlanner') || 'Journey Planner'}</h1>

// With options (if needed)
<p>{translate('common.welcome', { name: 'User' }) || 'Welcome'}</p>
```

### 4. Add new translation keys

Add new keys to both language files:

**English (`/src/i18n/locales/en.json`)**:
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

**Italian (`/src/i18n/locales/it.json`)**:
```json
{
  "newSection": {
    "title": "Nuovo Titolo", 
    "description": "Nuova Descrizione"
  }
}
```

## Language Configuration

The language configuration is in `/src/config.ts`:
- Default language: Italian (`it`)
- Available languages: Italian, English
- Language preference is stored in localStorage

## Language Switching

Users can switch languages using:
1. **Settings Panel**: Access via sidebar → Settings → Language toggle
2. **Programmatically**: Use `onChangeLang('en')` or `onChangeLang('it')`

## File Structure

```
src/
├── i18n/
│   ├── index.ts              # i18n configuration (client-side only)
│   └── locales/
│       ├── en.json           # English translations
│       └── it.json           # Italian translations
├── hooks/
│   └── useLocales.ts         # Translation hook with auto-initialization
└── components/
    └── custom/sideSheet/
        └── SettingsContent.tsx # Language switcher component
```

## Translation Keys Available

- `navigation.*` - Navigation items (sidebar, footer)
- `settings.*` - Settings page content
- `language.*` - Language switcher labels
- `common.*` - Common UI elements (buttons, states)
- `savedLocations.*` - Saved locations content
- `directions.*` - Directions/routing content

## Important Notes

### SSR Compatibility
- i18n is initialized client-side only to avoid Next.js SSR issues
- All translation calls include fallback values: `translate('key') || 'Fallback'`
- The `useLocales` hook automatically initializes i18n when first used

### Error Handling
- The implementation handles cases where translations aren't loaded yet
- Fallback values ensure the UI displays properly during initial load
- Language switching works seamlessly without page reload

## Adding More Languages

1. Add language config to `/src/config.ts`
2. Create new locale file in `/src/i18n/locales/`
3. Import and add to resources in `/src/i18n/index.ts`
4. Update the language switcher in SettingsContent if needed for more than 2 languages

## Development Server

The application is running on `http://localhost:3001` with hot reload enabled for translation changes.
