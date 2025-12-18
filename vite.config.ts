import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }], remarkGfm, remarkMath],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-dark-default",
            keepBackground: false,
          },
        ],
        rehypeKatex,
      ],
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  // 关闭所有 sourceMap（开发和生产环境）
  build: {
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
  // 确保开发模式也不生成 sourceMap
  esbuild: {
    sourcemap: false,
  },
});
