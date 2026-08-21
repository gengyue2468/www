declare module "markdown-it-texmath" {
  import type MarkdownIt from "markdown-it";

  interface TexmathOptions {
    delimiters?: string | string[];
    engine?: unknown;
    katexOptions?: Record<string, unknown>;
    outerSpace?: boolean;
  }

  function texmath(md: MarkdownIt, options?: TexmathOptions): void;

  export = texmath;
}
