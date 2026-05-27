import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/softtek-news",
  assetPrefix: "/softtek-news",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
