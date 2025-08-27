import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA and development configuration
  experimental: {
    // Enable experimental features if needed
    optimizeCss: true, // Enable CSS optimization
  },
  
  // Allow cross-origin requests for development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      // Cache Google Fonts for 1 year
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configure for mobile development
  env: {
    CUSTOM_KEY: 'mobile-development',
  },
  
  // Optimize images and fonts
  images: {
    domains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
  },
};


export default nextConfig;
