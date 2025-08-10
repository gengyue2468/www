import { calculateReadingTime } from "@/components/CalculateReadingTime";
import Header from "@/components/Header";
import Layout from "@/components/Layout";
import Wrapper from "@/components/Wrapper";
import { components } from "@/lib/markdown/config";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

const designMarkdown = `
# 字体

使用 [Google Fonts](https://fonts.google.com/) 缓存

- Inter Variable
- Noto Sans SC

# 标题

标题采用统一大小，字重为600

# 示例标题

# 文字

Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

**加粗文本**

*斜体文本*

>引用文本

# 列表

- Item 1
- Item 2
- Item 3

1. Item 1
2. Item 2
3. Item 3

> 仍在更新...

`;

export default function Design({ mdxSource, readingTime }) {
  return (
    <Layout title="设计">
      <Header
        title="设计"
        date="2025-08-06"
        readingTime={readingTime}
        desc="有关这个网站的设计语言与规范"
      />

      <Wrapper>
        <MDXRemote {...mdxSource} components={components} />
      </Wrapper>
    </Layout>
  );
}

export async function getStaticProps() {
  const mdxSource = await serialize(designMarkdown);
  const readingTime = calculateReadingTime(designMarkdown);
  return { props: { mdxSource, readingTime } };
}
