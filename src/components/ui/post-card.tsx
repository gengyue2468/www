import type { BlogPost } from "#/lib/blog";

export interface PostCardProps {
  post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
  const tags = Array.isArray(post.tags)
    ? post.tags
    : post.tags
      ? [post.tags]
      : [];

  return (
    <div className="post-card">
      <h2
        className="post-card-title"
        style={{ viewTransitionName: `blog-title-${post.slug}` }}
      >
        <a
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {post.title}
        </a>
      </h2>
      {post.summary && (
        <p className="post-card-summary line-clamp-2">{post.summary}</p>
      )}
      {(tags.length > 0 || post.date) && (
        <div className="post-card-meta">
          {tags.length > 0 && (
            <span className="post-card-tags">
              {tags.map((tag: any, index: number) => (
                <span key={tag}>
                  <a
                    href={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="muted-link"
                  >
                    {tag}
                  </a>
                  {index < tags.length - 1 && <span className="mx-1">,</span>}
                </span>
              ))}
            </span>
          )}
          {post.date && (
            <>
              <span className="mx-1">·</span>
              <span className="post-card-date">{post.date}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
