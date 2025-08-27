"use client";
import { useEffect, useState } from 'react';

export default function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts are available
    const checkFonts = async () => {
      try {
        if ('fonts' in document) {
          // Wait for fonts to load or timeout after 3 seconds
          await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 3000))
          ]);
        }
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading failed, using fallbacks');
        setFontsLoaded(true); // Still set to true to show content
      }
    };

    checkFonts();
  }, []);

  // Add a class to body when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      document.body.classList.add('fonts-loaded');
    }
  }, [fontsLoaded]);

  return null; // This component doesn't render anything
}
