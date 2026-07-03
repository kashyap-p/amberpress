import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the Next.js dev-tools overlay button so the app looks like a
  // clean personal project in the preview.
  devIndicators: false,
};

export default nextConfig;
