import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import FontLoader from "@/components/FontLoader";
import I18nProvider from "@/components/I18nProvider";
import "./globals.css";

// Configure fonts with fallbacks and error handling
const inter = Inter({ 
  subsets: ["latin"],
  fallback: ['system-ui', 'arial', 'sans-serif'],
  display: 'swap',
  adjustFontFallback: false, // Disable to prevent loading issues
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ['system-ui', 'arial', 'sans-serif'],
  display: 'swap',
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ['ui-monospace', 'monospace'],
  display: 'swap',
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "Attraction - Mobility Management Platform",
  description: "Plan, track, and manage your travel with Attraction",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Attraction",
    startupImage: "/logo.png",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Attraction",
    title: "Attraction - Mobility Management Platform",
    description: "Plan, track, and manage your travel with Attraction",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary",
    title: "Attraction - Mobility Management Platform",
    description: "Plan, track, and manage your travel with Attraction",
    images: ["/logo.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Attraction",
    "application-name": "Attraction",
    "msapplication-TileColor": "#208BF0",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="mask-icon" href="/logo.png" color="#208BF0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
      >
        <FontLoader />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
