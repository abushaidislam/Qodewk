import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@qodewk/protocol", "@qodewk/pricing"],
  experimental: {
    // optimize packages
  }
};

export default nextConfig;
