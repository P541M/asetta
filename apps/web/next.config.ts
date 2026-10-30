import type { NextConfig } from "next";

const MARKETING_URL = "https://www.asetta.me";

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // VERCEL_ENV, not NODE_ENV: Vercel builds previews with NODE_ENV=production too, and a
    // preview's "/" must open its own login page, not the live marketing site. Locally it is unset.
    const isProduction = process.env.VERCEL_ENV === "production";
    // Browsers cache a 308, so only production's are permanent.
    const permanent = isProduction;
    return [
      {
        source: "/",
        destination: isProduction ? MARKETING_URL : "/login",
        permanent,
      },
      // The legal pages live only on the marketing site, so every environment sends them there.
      { source: "/legal/terms", destination: `${MARKETING_URL}/terms`, permanent },
      { source: "/legal/privacy", destination: `${MARKETING_URL}/privacy`, permanent },
      { source: "/terms", destination: `${MARKETING_URL}/terms`, permanent },
      { source: "/privacy", destination: `${MARKETING_URL}/privacy`, permanent },
    ];
  },
};

export default config;
