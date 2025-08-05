/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/fonts/:path*', // 匹配所有以/fonts/开头的请求
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/fonts/:path*` // 代理到CDN对应路径
      },
      {
        source: '/static/:path*', // 匹配所有以/fonts/开头的请求
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/static/:path*` // 代理到CDN对应路径
      },
    ];
  }
};

export default nextConfig;

