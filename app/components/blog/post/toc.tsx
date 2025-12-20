import SidebarTemplate from "@/components/public/template/sidebar-template";
import type { TocItem } from "@/types/post";

interface TocProps {
  toc: TocItem[];
}

export default function Toc({ toc }: TocProps) {
  return (
    <>
      {toc.length > 0 && (
        <SidebarTemplate>
          <h3 className="font-medium mb-2 text-neutral-600 dark:text-neutral-400">
            目录
          </h3>
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
        </SidebarTemplate>
      )}
    </>
  );
}
