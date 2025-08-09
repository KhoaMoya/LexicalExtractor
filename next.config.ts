import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development for easier debugging
  // register: true, // Auto-register the service worker (default is true)
  // scope: '/', // Scope of the service worker (default is '/')
  // sw: 'sw.js', // Service worker file name (default is 'sw.js')
});

module.exports = withPWA({
  // Your existing Next.js configuration goes here
  reactStrictMode: true,
  // Other Next.js configs...
});

export default nextConfig;
