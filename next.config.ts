import type { NextConfig } from "next";

const config: NextConfig = {
  // Lets a one-off build (NEXT_DIST_DIR=.next-build next build) run without touching the dev server's cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["pg", "sharp", "nodemailer"],
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};

export default config;
