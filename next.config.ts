import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    const noCacheHeaders = [
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
      { key: 'Pragma', value: 'no-cache' },
      { key: 'Expires', value: '0' },
    ];
    return [
      { source: '/dashboard/:path*', headers: noCacheHeaders },
      { source: '/config/:path*', headers: noCacheHeaders },
      { source: '/payments/:path*', headers: noCacheHeaders },
      { source: '/calendar/:path*', headers: noCacheHeaders },
    ];
  },
};

export default nextConfig;
