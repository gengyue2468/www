// lib/markdown/plugins.js
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFootnotes from "remark-footnotes";
import remarkGemoji from "remark-gemoji";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// 导出常用的 remark 插件
export const remarkPlugins = [
  remarkGfm, // GitHub Flavored Markdown (表格、任务列表等)
  remarkMath, // 数学公式支持
  [remarkFootnotes, { inlineNotes: true }], // 脚注支持
  remarkGemoji, // 新增：GitHub 风格表情符号支持
];

// 导出常用的 rehype 插件
export const rehypePlugins = [
  [rehypeKatex, { 
    output: 'htmlAndMathml',
    throwOnError: false,
    errorColor: '#cc0000'
  }], // 数学公式渲染
  [rehypeHighlight, { 
    ignoreMissing: true,
    aliases: {
      typescript: ['ts', 'tsx'],
      javascript: ['js', 'jsx'],
      shell: ['bash', 'sh', 'zsh'],
    }
  }], // 代码高亮
  rehypeSlug, // 为标题添加ID
  [rehypeAutolinkHeadings, { behavior: "wrap" }], // 为标题添加锚点链接
];

// 默认导出所有插件配置
export default {
  remarkPlugins,
  rehypePlugins,
};