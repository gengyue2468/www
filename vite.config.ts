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
import { visit } from "unist-util-visit";

function remarkSmartQuotes() {
  return (tree: any) => {
    visit(tree, "text", (node: any) => {
      if (node.value && typeof node.value === "string") {
        node.value = node.value
          .replace(/\u201c/g, "「")
          .replace(/\u201d/g, "」");
        
        let quoteCount = 0;
        node.value = node.value.replace(/"/g, () => {
          quoteCount++;
          return quoteCount % 2 === 1 ? "「" : "」";
        });
      }
    });
  };
}

export default defineConfig({
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkFrontmatter, 
        [remarkMdxFrontmatter, { name: "frontmatter" }], 
        remarkGfm, 
        remarkMath,
        remarkSmartQuotes,
      ],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-dark-default",
            keepBackground: false,
            showLineNumbers: true,
            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
              node.properties.className ||= [];
              node.properties.className.push("line");
            },
            onVisitHighlightedLine(node: any) {
              node.properties.className ||= [];
              node.properties.className.push("highlight-line");
            },
            onVisitHighlightedWord(node: any) {
              node.properties.className = ["highlight-word"];
            },
          },
        ],
        rehypeKatex,
      ],
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
  esbuild: {
    sourcemap: false,
  },
});
