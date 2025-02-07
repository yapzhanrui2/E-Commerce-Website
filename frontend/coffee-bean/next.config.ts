import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['coffee-bean-images.s3.ap-southeast-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
