import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.130",
    "http://192.168.1.130:3001",
  ],
};

export default nextConfig;
