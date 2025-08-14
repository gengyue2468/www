/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  compiler: {
   removeConsole: process.environment.NODE_ENVIRONMENT === 'production'
   }
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // 匹配所有HTTP域名
      },
      {
        protocol: 'https',
        hostname: '**', // 匹配所有HTTPS域名
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/fonts/:path*` // 代理到CDN对应路径
      },
      {
        source: '/static/:path*', 
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/static/:path*` // 代理到CDN对应路径
      },
    ];
  }
};

export default nextConfig;
    

