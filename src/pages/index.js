import Layout from "@/components/Layout";

const Home = () => {
  return (
    <Layout
      title="耿越"
    >
      <div className="mb-8">
        <h1 className="font-semibold mb-6">耿越</h1>

        <p className="mb-6">
          你好👋! 我是<a href="https://hust.edu.cn">@华中科技大学</a>
          计算机科学与技术专业的一名大一新生。
        </p>

        <h1 className="font-semibold mb-6">我的设备</h1>

        <p className="mb-2">
          荣耀 GT Pro 配备 骁龙8至尊领先版 芯片 及 12+256GB 内存组合.
        </p>

        <p className="mb-2">
          Apple iMac 24’ (2021) 配备Apple M1 芯片 及 16+512GB 内存组合.
        </p>

        <p className="mb-6">
          惠普 暗影精灵 11 16’ (2025) 配备 英特尔 i9-14900HX 处理器 和 英伟达
          RTX5070 显示卡 及 32GB+1TB 内存组合.
        </p>

        <h1 className="font-semibold mb-6">联系我</h1>

        <p className="mb-2">
          GitHub: <a href="https://github.com/gengyue2468">@gengyue2468</a>
        </p>
        <p className="mb-2">
          电子邮件:
          <a href="mailto:gengyue2468@outlook.com">gengyue2468@outlook.com</a>
        </p>
      </div>
    </Layout>
  );
};

export default Home;
