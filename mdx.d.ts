declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module "remark-collapse" {
  import type { Plugin } from "unified";
  
  interface CollapseOptions {
    test: string | RegExp | ((text: string, node: any) => boolean);
    summary?: string | ((text: string) => string);
  }
  
  const collapse: Plugin<[CollapseOptions?]>;
  export default collapse;
}


