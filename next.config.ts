import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  tsconfig:{
    ignoreBuildErrors:true
  },
  eslint:{
    ignoreDuringBuilds:true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https", // Protocol used by Unsplash images
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
