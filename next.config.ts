import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.api-sports.io", pathname: "/flags/**" }, { protocol: "https", hostname: "media.api-sports.io", pathname: "/football/leagues/**" }, { protocol: "https", hostname: "media.api-sports.io", pathname: "/football/teams/**" }],
  },
  async redirects() {
    return ["en", "es", "fr", "de", "it", "pt"].flatMap((locale) => [
      {
        source: `/${locale}/predictions`,
        destination: `/${locale}/today`,
        permanent: true,
      },
      {
        source: `/${locale}/performance`,
        destination: `/${locale}/results`,
        permanent: true,
      },
    ]);
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Accel-Buffering", value: "no" },
      ],
    }];
  },
};

export default nextConfig;
