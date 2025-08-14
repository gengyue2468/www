/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 将webpack配置移到其他配置下方避免干扰
  // 2. 确保productionBrowserSourceMaps是顶级属性
  productionBrowserSourceMaps: false,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/fonts/:path*`
      },
      {
        source: '/static/:path*', 
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/static/:path*`
      },
    ];
  },
  
  // 3. 将webpack配置放在最后并修复缺少的逗号
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 200000, // 单个 chunk 最大 200KB
      minSize: 10000   // 最小 10KB
    }
    return config
  }
};

export default nextConfig;