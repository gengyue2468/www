import { MDXRemote } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";

import { mdxComponents } from "../lib/markdown/config";

const MdxContent = ({
  mdxSource,
  components = {},
  remarkPlugins = [],
  rehypePlugins = [],
}) => {
  const allRemarkPlugins = [remarkGfm, ...remarkPlugins];
  const allRehypePlugins = [
    [
      rehypePrism,
      {
        showLineNumbers: true,
        ignoreMissing: true,
        defaultLanguage: "javascript",
      },
    ],
    ...rehypePlugins,
  ];

  return (
    <MDXRemote
      {...mdxSource}
      components={{
        ...mdxComponents,
        ...components,
        pre: (props) => (
          <pre
            className="my-6 rounded-none sm:rounded-xl bg-neutral-100 dark:bg-neutral-900 -translate-x-8! w-[calc(100%+4rem)]! text-black dark:text-white mono p-4 text-sm overflow-x-auto"
            {...props}
          />
        ),
        code: (props) => <code className="mono" {...props} />,
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
