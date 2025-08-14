/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 200000, // 单个 chunk 最大 200KB
      minSize: 10000   // 最小 10KB
    }
    return config
  }
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 修正为 process.env.NODE_ENV
  }, // 这里之前缺少逗号，导致后面的reactStrictMode成为compiler的属性
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