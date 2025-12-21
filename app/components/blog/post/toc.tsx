import SidebarTemplate from "@/components/public/template/sidebar-template";
import type { TocItem } from "@/types/post";

interface TocProps {
  toc: TocItem[];
}

export default function Toc({ toc }: TocProps) {
  const generateNumbering = () => {
    const counters: number[] = [];
    return toc.map((item) => {
      const level = item.level - 2;
      
      if (level < 0) {
        return {
          ...item,
          numbering: '',
          indent: 0,
        };
      }
      
      if (counters.length <= level) {
        counters.push(...Array(level - counters.length + 1).fill(0));
      } else {
        counters.length = level + 1;
      }
      
      counters[level]++;
      
      const numbering = counters.slice(0, level + 1).join('.');
      
      return {
        ...item,
        numbering,
        indent: level,
      };
    });
  };

  const numberedToc = generateNumbering();

  return (
    <>
      {toc.length > 0 && (
        <SidebarTemplate>
          <h3 className="font-medium mb-2 text-neutral-600 dark:text-neutral-400">
            目录
          </h3>
          <nav className="space-y-1">
            {numberedToc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="no-underline! block"
                style={{ paddingLeft: `${item.indent * 0.75}rem` }}
              >
                {item.numbering}. {item.text}
              </a>
            ))}
          </nav>
        </SidebarTemplate>
      )}
    </>
  );
}
