import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ask',
        destination: 'http://127.0.0.1:8000/ask',
      },
      {
        source: '/images/:path*',
        destination: 'http://127.0.0.1:8000/images/:path*',
      }
    ]
  }
};

export default nextConfig;
