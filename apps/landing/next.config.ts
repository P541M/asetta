/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'https://app.kivo.com/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: 'https://app.kivo.com/register',
        permanent: true,
      },
    ];
  },
};

export default nextConfig; 