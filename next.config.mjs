/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

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

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 优化客户端构建的代码分割
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000, // 20KB
        maxSize: 200000, // 200KB (关键：限制单个 chunk 的最大尺寸)
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `vendor_${packageName.replace("@", "")}`;
            },
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
