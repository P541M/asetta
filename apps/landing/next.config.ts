/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "https://asetta.vercel.app/login",
        permanent: true,
      },
      {
        source: "/register",
        destination: "https://asetta.vercel.app/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
