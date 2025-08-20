import { MDXRemote } from "next-mdx-remote";
import { mdxComponents } from "@/lib/markdown/config";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown/plugins";

const MdxContent = ({
  mdxSource,
  components = {},
}) => {
  return (
    <div className="mdx-content">
      <MDXRemote
        {...mdxSource}
        components={{
          ...mdxComponents,
          ...components,
        }}
        options={{
          mdxOptions: {
            remarkPlugins,
            rehypePlugins,
          },
        }}
      />
    </div>
  );
};

export default MdxContent;
