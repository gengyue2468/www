import { useState, useRef } from "react";
import { MDXRemote } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { mdxComponents } from "../lib/markdown/config";

// 自定义代码块组件（无高亮）
const CodeBlock = ({ children, className, ...props }) => {
  // 提取语言信息
  const language = className?.replace(/language-/, "") || "text";
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  // 复制代码到剪贴板
  const copyToClipboard = () => {
    if (codeRef.current) {
      const code = codeRef.current.textContent;
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="my-6 rounded-none sm:rounded-xl overflow-hidden transition-all duration-300 -translate-x-8 w-[calc(100%+4rem)] border border-neutral-200 dark:border-neutral-800">
      <div className="flex flex-row items-center justify-between px-8 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium bg-[#f5f7ff] dark:bg-[#0d1117]">
        <span className="text-xs opacity-50 capitalize">{language}</span>
        <div>
          <button
            onClick={copyToClipboard}
            className="mt-0.5 transition-all duration-500 opacity-50 hover:opacity-100"
            aria-label={copied ? "已复制" : "复制代码"}
          >
            {copied ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      </div>

      {/* 基础代码展示（无高亮） */}
      <pre
        className={cn(
          "mono px-8 py-2 overflow-x-auto text-sm bg-neutral-50 dark:bg-neutral-900",
        )}
        {...props}
      >
        <code
          ref={codeRef}
          className={cn(className, "mono")}
          style={{ fontSize: "0.875rem", lineHeight: "1.5" }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

const MdxContent = ({
  mdxSource,
  components = {},
  remarkPlugins = [],
  rehypePlugins = [],
}) => {
  // 仅保留必要的remark插件（移除了代码高亮相关的rehype插件）
  const allRemarkPlugins = [remarkGfm, ...remarkPlugins];
  
  // 不添加任何代码高亮相关的rehype插件
  const allRehypePlugins = [...rehypePlugins];

  return (
    <MDXRemote
      {...mdxSource}
      components={{
        ...mdxComponents,
        ...components,
      }}
      options={{
        mdxOptions: {
          remarkPlugins: allRemarkPlugins,
          rehypePlugins: allRehypePlugins,
        },
      }}
    />
  );
};

export default MdxContent;