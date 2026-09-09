import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only for Docker containers, not Vercel
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
    ],
  },
};

export default nextConfig;
