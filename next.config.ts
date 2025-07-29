import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://www.asetta.me",
        permanent: true,
      },
      {
        source: "/legal/terms",
        destination: "https://www.asetta.me/terms",
        permanent: true,
      },
      {
        source: "/legal/privacy",
        destination: "https://www.asetta.me/privacy",
        permanent: true,
      },
      // Also handle direct /terms and /privacy routes for consistency
      {
        source: "/terms",
        destination: "https://www.asetta.me/terms",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "https://www.asetta.me/privacy",
        permanent: true,
      },
    ];
  },
};

export default config;
