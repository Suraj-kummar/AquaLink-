import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow loading remote textures from Three.js examples CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
