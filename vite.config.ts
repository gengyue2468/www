import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import { defineConfig } from "vite";
import path from "path";
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

function remarkCustomDirectives() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        if (node.name === "details") {
          const data = node.data || (node.data = {});
          const attributes = node.attributes || {};
          const summary = attributes.summary || "展开";

          data.hName = "details";
          data.hProperties = {};

          node.children.unshift({
            type: "paragraph",
            data: {
              hName: "summary",
              hProperties: {},
            },
            children: [{ type: "text", value: summary }],
          });
        }
      }
    });
  };
}

function rehypeExtractToc() {
  return (tree: any) => {
    const toc: Array<{ id: string; text: string; level: number }> = [];

    visit(tree, "element", (node: any) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const level = parseInt(node.tagName.charAt(1));
        const id = node.properties?.id || "";

        let text = "";
        visit(node, "text", (textNode: any) => {
          text += textNode.value;
        });

        if (id && text) {
          toc.push({ id, text: text.trim(), level });
        }
      }
    });

    tree.children.unshift({
      type: "mdxjsEsm",
      value: `export const toc = ${JSON.stringify(toc)};`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "toc" },
                    init: {
                      type: "Literal",
                      value: toc,
                      raw: JSON.stringify(toc),
                    },
                  },
                ],
              },
              specifiers: [],
              source: null,
            },
          ],
        },
      },
    });
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./app/components"),
      "@/routes": path.resolve(__dirname, "./app/routes"),
      "@/blog": path.resolve(__dirname, "./app/blog"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/utils": path.resolve(__dirname, "./app/utils"),
    },
  },
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkGfm,
        remarkMath,
        remarkSmartQuotes,
        remarkDirective,
        remarkCustomDirectives,
      ],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark-default",
            },
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
        [
          rehypeRaw,
          {
            passThrough: [
              "mdxjsEsm",
              "mdxFlowExpression",
              "mdxJsxFlowElement",
              "mdxJsxTextElement",
              "mdxTextExpression",
            ],
          },
        ],
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["heading-link no-underline!"],
            },
          },
        ],
        rehypeExtractToc,
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
