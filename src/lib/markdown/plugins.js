import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const remarkPlugins = [
  remarkGfm,
  remarkMath,
  remarkGemoji,
];

export const rehypePlugins = [
  [
    rehypeKatex,
    {
      output: "htmlAndMathml",
      throwOnError: false,
      errorColor: "#cc0000",
    },
  ],
  [
    rehypeHighlight,
    {
      ignoreMissing: true,
      aliases: {
        typescript: ["ts", "tsx"],
        javascript: ["js", "jsx"],
        shell: ["bash", "sh", "zsh"],
      },
    },
  ],
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap" }],
];

export default {
  remarkPlugins,
  rehypePlugins,
};
