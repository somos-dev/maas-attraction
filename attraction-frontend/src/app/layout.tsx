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
};

export const metadata: Metadata = {
  metadataBase: new URL("https://maas.somos.srl"),
  title: "Attraction - Mobility Management Platform",
  description: "Plan, track, and manage your travel with Attraction",

  // 🔗 Canonical URL (SEO)
  alternates: {
    canonical: "/",
  },

  // 📱 PWA + Mobile app support
  manifest: "/manifest.json",
  applicationName: "Attraction",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Attraction",
  },
  formatDetection: {
    telephone: false,
  },

  // Theme colors for browser UI
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
    other: [
      {
        rel: "mask-icon",
        url: "/logo.png",
        color: "#208BF0",
      },
    ],
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    siteName: "Attraction",
    title: "Attraction - Mobility Management Platform",
    description: "Plan, track, and manage your travel with Attraction",
    url: "https://maas.somos.srl",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Attraction Logo",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary",
    site: "@yourtwitterhandle", // optional
    title: "Attraction - Mobility Management Platform",
    description: "Plan, track, and manage your travel with Attraction",
    images: ["/logo.png"],
  },

  // Windows / MS Tiles
  other: {
    "msapplication-TileColor": "#208BF0",
    "msapplication-config": "/browserconfig.xml",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Attraction",
  },
};


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
