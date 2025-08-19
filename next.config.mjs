/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['p1.music.126.net', 'p2.music.126.net'], // 允许加载网易云音乐的图片
  },
}

module.exports = nextConfig
