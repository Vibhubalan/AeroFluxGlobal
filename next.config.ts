import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd()),
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
