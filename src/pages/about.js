import Header from "@/components/Header";
import Layout from "@/components/Layout";
import Wrapper from "@/components/Wrapper";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { calculateReadingTime } from "@/components/CalculateReadingTime";
import { components } from "@/lib/markdown/config";

const aboutMarkdown = `
# 关于我

我是[华中科技大学](https://hust.edu.cn/)计算机科学与技术专业的一名大一新生。高中毕业于[山东省烟台第一中学](http://ytyz.net/)。

自2020年起，我便开始接触一些前端知识。各种机缘巧合下接触到了当时还称作 Zeit.co 的 [Vercel](https://vercel.com)，从此对 [Next.js](https://nextjs.org) 产生了浓厚的兴趣。从此开始实践一些简单的项目，由于技术限制，基本上都是对着官方文档照猫画虎。

受 [Lee Robinson](https://leerob.com) 等开发者的启发，我逐渐接触了 [Chakra UI](https://chakra-ui.com) 和 [TailwindCSS](https://tailwindcss.com)。并在近两年接触了 [Radix UI](https://radix-ui.com) 和衍生的 [Shadcn UI](https://ui.shadcn.com)。

受 [Paco Coursey](https://paco.me) 和 [Rauno Freiberg](https://rauno.me) 等开发者的启发，我注重简约（Minimal）的设计风格。

目前关注 AI 对编程的协助作用。

## 网站介绍

本网站主要展示一些胡思乱想，可以认为是作者发疯的地方。文雅点说，可以称作情绪的避风港。使用了：

- Next.js
- TailwindCSS
- Notion API
- MDX

受以下网站启发：

- [Apple Newsroom](https://apple.com/newsroom)
- [Lee Robinson](https://leerob.com)
- [Paco Coursey](https://paco.me) 
- [Rauno Freiberg](https://rauno.me) 
- [Manuel “Manu” Moreale](https://manuelmoreale.com/)


## 联系方式

可以通过以下方式联系我：

- 邮箱：[gengyue2468@outlook.com](mailto:gengyue2468@outlook.com/)
-  GitHub：[@gengyue2468](https://github.com/gengyue2468)
`;

export default function About({ mdxSource, readingTime }) {
  return (
    <Layout title="关于">
      <Header
        title="关于"
        date="2025-08-06"
        readingTime={readingTime}
        desc="关于“我”和“这个网站”的一切（似乎并不完全是一切，亦是不可能是一切）"
      />
      <Wrapper>
        <MDXRemote {...mdxSource} components={components} />
      </Wrapper>
    </Layout>
  );
}

export async function getStaticProps() {
  const readingTime = calculateReadingTime(aboutMarkdown);
  const mdxSource = await serialize(aboutMarkdown);

  return {
    props: {
      mdxSource,
      readingTime, // 将阅读时间传递给组件
    },
  };
}
