import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["pg"],
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};

export default config;
