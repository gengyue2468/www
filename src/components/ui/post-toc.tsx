import type { TocItem } from "../../lib/markdown";

export interface PostTocProps {
  items: TocItem[];
}

export default function PostToc({ items }: PostTocProps) {
  if (!items.length) return null;

  return (
    <details className="toc-collapsible" open>
      <summary className="toc-trigger" aria-label="切换目录">
        <span>目录</span>
        <svg
          className="toc-trigger-icon"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.5 6.5L8 11l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div className="toc-panel">
        <ol className="toc-list">
          {items.map((item) => (
            <li key={item.id} className={`toc-item toc-level-${item.level}`}>
              <a href={`#${item.id}`} className="toc-link">
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}