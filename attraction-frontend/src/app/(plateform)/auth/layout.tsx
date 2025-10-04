// import AnimatedIllustration from "@/components/AnimatedIllustration";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import GuestGuard from "@/guards/GuestGuard";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>

      <div className="relative py-3 bg-white z-1 dark:bg-gray-900 sm:p-0 max-h-screen overflow-hidden">
        <ThemeProvider>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0 ">
            {/* Language Switch Button */}
            {/* <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button 
          onClick={() => onChangeLang('en')} 
          className={`border p-2 rounded-md text-sm cursor-pointer transition-colors ${
            currentLang.value === 'en' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          {String(translate('language.engShort'))}
        </button>
        <button 
          onClick={() => onChangeLang('it')} 
          className={`border p-2 rounded-md text-sm cursor-pointer transition-colors ${
            currentLang.value === 'it' ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          {String(translate('language.itaShort'))}
        </button>
      </div> */}
            {children}
            <div className="relative lg:w-1/2 w-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden max-h-screen overflow-hidden">
              {/* <Link href='' className="block mb-4">
                  <Image
                    className="absolute b-0 w-full h-full mx-auto"
                    fill
                    src="/images/logo/auth-logo3.png"
                    alt="Logo"
                    />
                </Link>
                <AnimatedIllustration/> */}
              <div
                className="h-full w-full flex items-center justify-center"
                style={{
                  background: `
                radial-gradient(ellipse 170% 120% at bottom right, #57cf4cff 20%, transparent 90%),
                radial-gradient(ellipse 120% 100% at top left, #57cf4cff 0%, transparent 80%),
                radial-gradient(ellipse 100% 80% at bottom left, #4fcbdeff 0%, transparent 80%),
                radial-gradient(ellipse 100% 80% at top right, #4fcbdeff 0%, transparent 80%)
              `
                }}
              >
                <div className="flex flex-row items-center justify-center">
                  <div className="font-description text-white font-semibold text-4xl">all your mobility</div>
                  <Image
                    className=""
                    src="/images/Official-logos/UI-detailed/LogoBiancoCover.png"
                    alt="Logo"
                    width={170}
                    height={170}
                  />
                </div>
              </div>


            </div>
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </GuestGuard>
  );
}
