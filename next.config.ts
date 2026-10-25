import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization!.minimize = false;
      config.optimization!.minimizer = [];
    }
    return config;
  },
};

export default nextConfig;
