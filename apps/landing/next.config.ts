import type { NextConfig } from "next";
import { LOGIN_URL, REGISTER_URL } from "./src/lib/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Agent rules live in the root CLAUDE.md; stop `next dev` writing its own AGENTS.md here.
  agentRules: false,
  async redirects() {
    return [
      // Auth lives on the main application; bounce auth routes there.
      {
        source: "/login",
        destination: LOGIN_URL,
        permanent: true,
      },
      {
        source: "/register",
        destination: REGISTER_URL,
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
      // There is no pricing page; the product is free.
      {
        source: "/pricing",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
