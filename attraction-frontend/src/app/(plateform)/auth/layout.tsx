import AnimatedIllustration from "@/components/AnimatedIllustration";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import GuestGuard from "@/guards/GuestGuard";
import Image from "next/image";
import Link from "next/link";
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
          {children}
          <div className="relative lg:w-1/2 w-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden max-h-screen overflow-hidden">
                <Link href="/" className="block mb-4">
                  <Image
                    className="absolute b-0 w-full h-full mx-auto"
                    fill
                    src="/images/logo/auth-logo3.png"
                    alt="Logo"
                    />
                </Link>
                <AnimatedIllustration/>
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
