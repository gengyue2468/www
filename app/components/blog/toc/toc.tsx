import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocProps {
  toc?: TocItem[];
}

export default function Toc({ toc }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  const filteredToc = toc?.filter((item) => item.level >= 2) || [];

  const getNumbering = (items: TocItem[]) => {
    const counters: number[] = [0, 0, 0, 0, 0];
    return items.map((item) => {
      const level = item.level - 2;
      counters[level]++;
      for (let i = level + 1; i < counters.length; i++) {
        counters[i] = 0;
      }
      const numbering = counters.slice(0, level + 1).join(".");
      return { ...item, numbering };
    });
  };

  const numberedToc = getNumbering(filteredToc);

  useEffect(() => {
    if (filteredToc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    filteredToc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [filteredToc]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const getBarWidth = (level: number) => {
    const baseWidth = 32;
    const decrement = 8;
    return Math.max(baseWidth - (level - 2) * decrement, 12);
  };

  if (filteredToc.length === 0) return null;

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
            will-change-transform cursor-pointer
          ${isHovered ? "bg-stone-50 border border-stone-200 rounded-lg p-1 max-h-[75vh] overflow-y-auto" : ""}
        `}
      >
        <ul className={isHovered ? "space-y-0" : "space-y-2"}>
          {numberedToc.map((item: any) => {
            const isActive = activeId === item.id;
            const indent = (item.level - 2) * 12;

            return (
              <li
                key={item.id}
                style={{ paddingLeft: isHovered ? `${indent}px` : "0" }}
                className=""
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className="block w-full text-left"
                >
                  {!isHovered && (
                    <div
                      className={`
                        h-1 rounded-full 
                        ${isActive ? "bg-stone-800" : "bg-stone-300 hover:bg-stone-400"}
                      `}
                      style={{ width: `${getBarWidth(item.level)}px` }}
                    />
                  )}

                  {isHovered && (
                    <div
                      className={`
                        flex items-baseline gap-2 py-1 px-2 rounded-md text-sm duration-200 cursor-pointer
                        ${isActive ? "bg-stone-200/50 text-stone-900 font-medium" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}
                      `}
                    >
                      <span className="text-sm text-stone-400 shrink-0">
                        {item.numbering}
                      </span>
                      <span className="line-clamp-2 font-medium text-base">
                        {item.text}
                      </span>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
