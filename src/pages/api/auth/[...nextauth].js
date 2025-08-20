import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// 使用新的 authOptions 配置对象
export const authOptions = {
  // 配置GitHub登录 provider
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email", // 明确指定所需的权限范围
        },
      },
    }),
  ],
  
  pages: {
    signIn: "/auth/signin", // 登录页路径，需确保该页面存在
    error: "/auth/error",   // 错误页路径
  },
  
  // 会话管理配置
  session: {
    strategy: "jwt", // 使用JWT而非数据库存储会话
    maxAge: 30 * 24 * 60 * 60, // 30天会话有效期
  },
  
  // 回调函数配置
  callbacks: {
    // 处理会话数据
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // 将GitHub用户ID添加到会话
        session.accessToken = token.accessToken; // 添加访问令牌到会话
      }
      return session;
    },
    // 处理JWT数据
    async jwt({ token, user, account }) {
      // 初始登录
      if (account && user) {
        token.id = user.id; // 存储用户ID到JWT
        token.accessToken = account.access_token; // 存储访问令牌
      }
      return token;
    },
    // 重定向回调
    async redirect({ url, baseUrl }) {
      // 允许相对URL重定向
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 允许相同基域的重定向
      else if (new URL(url).origin === baseUrl) return url;
      // 默认返回基域
      return baseUrl;
    },
  },
  
  // 确保secret正确配置
  secret: process.env.NEXTAUTH_SECRET,
  
  // 调试模式（开发环境启用）
  debug: process.env.NODE_ENV === "development",
};

// 导出处理函数
export default NextAuth(authOptions);