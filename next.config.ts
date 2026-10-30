import type { NextConfig } from "next";

const config: NextConfig = {
  // Lets a one-off build (NEXT_DIST_DIR=.next-build next build) run without touching the dev server's cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["pg", "sharp", "nodemailer"],
  async redirects() {
    return [
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/insights/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};

export default config;
