import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import hljs from 'highlight.js';

import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';   
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('c', c);                
hljs.registerLanguage('cpp', cpp);               
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);

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
      hljs,
      ignoreMissing: true,
      aliases: {
        c: ["c", "h"],
        cpp: ["cpp", "c++", "hpp", "hxx", "cc"],
        typescript: ["ts", "tsx", "typescriptreact"],
        javascript: ["js", "jsx", "javascriptreact"],
        shell: ["bash", "sh", "zsh", "shellscript"],
        html: ["htm", "html5"],
        css: ["css3", "scss", "sass"],
        json: ["json5", "jsonc"],
      },
      className: 'highlight-code',
    },
  ],
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap",
      properties: {
        className: ["anchor-link"],
        ariaLabel: "链接到标题"
      }
    }
  ],
];

export default {
  remarkPlugins,
  rehypePlugins,
};