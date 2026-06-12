import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Auth lives on the main application; bounce auth routes there.
      {
        source: "/login",
        destination: "https://asetta.me/login",
        permanent: true,
      },
      {
        source: "/register",
        destination: "https://asetta.me/register",
        permanent: true,
      },
      // Former narrative pages, merged into /about.
      {
        source: "/story",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/founders-note",
        destination: "/about",
        permanent: true,
      },
      // Pricing page removed — the product is simply free.
      {
        source: "/pricing",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
