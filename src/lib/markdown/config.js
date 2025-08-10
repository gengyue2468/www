import FileDisplay from "@/components/FileDisplay";
import Image from "@/components/Image";
import NextLink from "@/components/NextLink";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vs,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ children, className }) => {
  const language = className?.replace(/language-/, "") || "text";
  const { resolvedTheme } = useTheme();

  return (
    <SyntaxHighlighter
      style={resolvedTheme === "light" ? vs : vscDarkPlus}
      language={language}
      PreTag="div"
      className="p-4 rounded-lg overflow-x-auto"
    >
      {children}
    </SyntaxHighlighter>
  );
};

const components = {
  img: Image,
  a: NextLink,
  pre: ({ children }) => <div className="mono -translate-x-4! w-[calc(100%+2rem)]! mb-4">{children}</div>,
  code: CodeBlock,
  FileDisplay,
};
export { components };
