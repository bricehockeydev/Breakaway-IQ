import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep these out of the bundler — they load native binaries / engines at runtime.
  serverExternalPackages: [
    "ffmpeg-static",
    "fluent-ffmpeg",
    "@prisma/client",
    "@anthropic-ai/sdk",
  ],
};

export default nextConfig;
