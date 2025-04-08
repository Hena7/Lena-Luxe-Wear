import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
