/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async rewrites() {
    return [
      {
        source: "/fonts/:path*",
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/fonts/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
