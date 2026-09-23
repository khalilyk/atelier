import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  serverExternalPackages: ["pdf-parse"],
  // Images uploaded in the admin are served from Vercel Blob, so next/image
  // must be allowed to optimise that host (otherwise they 400 and appear broken).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  // Gated PDFs live outside /public, so they must be traced into the
  // serverless bundle for the download route to read them at runtime.
  outputFileTracingIncludes: {
    "/api/download/[resource]": ["private/downloads/**/*"],
  },
};

export default nextConfig;
