import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.*", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/user/:username',
        destination: '/u/:username',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
