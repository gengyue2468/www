import { calculateReadingTime } from "@/components/CalculateReadingTime";
import CommentSystem from "@/components/CommentSystem";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import MdxContent from "@/components/MdxContent";
import Wrapper from "@/components/Wrapper";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

const nowMarkdown = `

![Chris Griffin](/static/chris-griffin.webp)

# Reference

你可以参考这两篇文章： [How and why to make a /now page on your site](https://sive.rs/now2) 和 [About nownownow.com](https://nownownow.com/about)

## 所以，我最近在做什么？

- 正在军训
- 玩 Grand Theft Auto V
- 摆烂睡觉


## 设备

- 惠普 暗影精灵11（16 英寸） 配备 Intel Core i9-14900HX 处理器和 NVIDIA Geforce RTX 5070 显卡 32GB 内存和 1TB 硬盘
- Apple iMac (2021, 24 英寸) 配备 Apple M1 处理器 16GB内存和 512GB 储存空间
- 荣耀 GT Pro（第一代） 配备 Snapdragon 8 Elite 处理器 12GB + 12GB 运行内存和 256GB 储存空间
- 荣耀平板 10 配备 Snapdragon 7 Gen 3 处理器 12GB + 12GB 运行内存和 256GB 储存空间
`;

const desc =
  "我们为啥要保持一个“现状”页面? / Why we need to keep a “Now” page?";

export default function Now({ mdxSource, readingTime }) {
  return (
    <Layout title="现状" desc={desc}>
      <Header
        title="现状"
        date="2025-08-06"
        readingTime={readingTime}
        desc={desc}
      />

      <Wrapper>
        <MdxContent mdxSource={mdxSource} />
      </Wrapper>

      <CommentSystem slug="/now" />
    </Layout>
  );
}

export async function getStaticProps() {
  const mdxSource = await serialize(nowMarkdown);
  const readingTime = calculateReadingTime(nowMarkdown);
  return { props: { mdxSource, readingTime } };
}
