import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Read CLI package version at build time (not imported at runtime — monorepo boundary safe)
const cliPkg = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/cli/package.json"), "utf-8")
);

const nextConfig: NextConfig = {
  transpilePackages: ["@qodewk/protocol", "@qodewk/pricing"],
  env: {
    NEXT_PUBLIC_QODEWK_VERSION: cliPkg.version,
  },
  experimental: {
    // optimize packages
  }
};

export default nextConfig;
