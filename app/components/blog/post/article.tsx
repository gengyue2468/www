import { MDXProvider } from "@mdx-js/react";
import { Link } from "react-router";

interface ArticleProps {
  MDXContent: React.ComponentType;
  post: {
    file: string;
  };
  articleRef: React.RefObject<HTMLElement | null>;
  components: Record<string, React.ComponentType<any>> | any;
}

export default function Article({ MDXContent, post, articleRef, components }: ArticleProps) {
  return (
    <>
      <article
        ref={articleRef}
        className="mt-6 prose prose-lg prose-neutral dark:prose-invert prose-headings:font-semibold
        prose-li:-mx-6"
      >
        <MDXProvider components={components}>
          <MDXContent />
        </MDXProvider>
      </article>
      <div className="text-sm mt-8 flex flex-row items-center justify-between *:no-underline!">
        <Link
          to={`https://github.com/gengyue2468/www/edit/master/app/blog/${post.file}`}
          className="font-medium"
        >
          在 GitHub 上编辑 →
        </Link>
        <button
          type="button"
          className="font-medium cursor-pointer hover:opacity-75"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          顶部 ↑
        </button>
      </div>
    </>
  );
}
