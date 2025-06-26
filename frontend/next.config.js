/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Disable telemetry for faster builds
  experimental: {
    // instrumentationHook is no longer needed - removed deprecated option
  },
  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables configuration
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
  },
};

module.exports = nextConfig;
