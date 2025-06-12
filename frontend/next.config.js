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
    instrumentationHook: false,
  },
  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
