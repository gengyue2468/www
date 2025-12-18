import type { TocItem } from "../../../../types/post";

interface TocProps {
  toc: TocItem[];
}

export default function Toc({ toc }: TocProps) {
  return (
    <>
      {toc.length > 0 && (
        <div className="text-sm hidden md:block md:fixed md:right-[max(2rem,calc(50%-40rem))] md:top-16 w-48">
          <div className="font-medium mb-2 text-neutral-600 dark:text-neutral-400">
            目录
          </div>
          <nav className="space-y-1">
            {toc.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="no-underline! block"
              >
                {index + 1}.{item.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
