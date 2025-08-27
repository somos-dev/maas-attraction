"use client";

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Globe, Bell, Shield, Info } from 'lucide-react';
import useLocales from '@/hooks/useLocales';

const SettingsContent = () => {
  const { translate, currentLang, allLangs, onChangeLang } = useLocales();

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{translate('settings.title') || 'Settings'}</h2>
      </div>
      
      <Separator />
      
      {/* Language Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-medium">{translate('language.title') || 'Language'}</h3>
        </div>
        
        <div className="pl-7 space-y-3">
          <p className="text-sm text-muted-foreground">
            {translate('language.description') || 'Select your preferred language'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Label htmlFor="language-switch" className="text-sm">
                {translate('language.italian') || 'Italian'} / {translate('language.english') || 'English'}
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
                <button 
                  onClick={() => onChangeLang('en')} 
                  className={`border p-1 rounded-md text-xs cursor-pointer transition-colors ${
                    currentLang.value === 'en' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  ENG
                </button>
                <button 
                  onClick={() => onChangeLang('it')} 
                  className={`border p-1 rounded-md text-xs cursor-pointer transition-colors ${
                    currentLang.value === 'it' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  ITA
                </button>
            </div>
            {/* <Switch
              id="language-switch"
              checked={isEnglishSelected}
              onCheckedChange={handleLanguageToggle}
            /> */}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {translate('common.current') || 'Current'}: {currentLang.label}
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Preferences Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-medium">{translate('settings.notifications') || 'Notifications'}</h3>
        </div>
        
        <div className="pl-7 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="text-sm">
              {String(translate('settings.pushNotifications'))}
            </Label>
            <Switch id="push-notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="location-alerts" className="text-sm">
              {String(translate('settings.locationAlerts'))}
            </Label>
            <Switch id="location-alerts" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Privacy Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-medium">{translate('settings.privacy') || 'Privacy'}</h3>
        </div>
        
        <div className="pl-7 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-sharing" className="text-sm">
              {String(translate('settings.locationSharing'))}
            </Label>
            <Switch id="location-sharing" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="analytics" className="text-sm">
              {String(translate('settings.analytics'))}
            </Label>
            <Switch id="analytics" defaultChecked />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* About Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-medium">{translate('settings.about') || 'About'}</h3>
        </div>
        
        <div className="pl-7 space-y-2">
          <p className="text-sm text-muted-foreground">
            {translate('common.version') || 'Version'} 1.0.0
          </p>
          <p className="text-sm text-muted-foreground">
            Attraction - {String(translate('common.mobilityManagementPlatform'))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
