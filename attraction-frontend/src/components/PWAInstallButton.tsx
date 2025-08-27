"use client";
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function PWAInstallButton({ 
  variant = "default", 
  size = "default",
  className = ""
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const handleInstall = async () => {
    await installApp();
  };

  if (isInstalled) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        App Installed
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstall}
      variant={variant}
      size={size}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
}
