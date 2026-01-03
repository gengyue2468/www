interface TocItem {
  id: string;
  text: string;
  level: number;
  numbering?: string;
}

interface TocListProps {
  toc: TocItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  compact?: boolean;
}

export default function TocList({ toc, activeId, onItemClick, compact = false }: TocListProps) {
  return (
    <ul className={`max-w-prose mx-auto ${compact ? "space-y-0.5" : "space-y-0.5"}`}>
      {toc.map((item) => {
        const isActive = activeId === item.id;
        const indent = (item.level - 2) * (compact ? 12 : 16);

        return (
          <li
            key={item.id}
            style={{ paddingLeft: `${indent}px` }}
          >
            <button
              onClick={() => onItemClick(item.id)}
              className={`
                w-full text-left flex items-baseline gap-2 py-1 px-2 rounded-lg transition-colors cursor-pointer
                ${compact ? "py-1 px-2" : "py-2 px-2 rounded-lg"}
                ${isActive ? "bg-stone-200/50 text-stone-900 font-medium" : "text-stone-800 hover:bg-stone-200/50 hover:text-stone-900"}
              `}
            >
              <span className={`text-stone-800 font-medium shrink-0 ${compact ? "text-sm" : "text-sm"}`}>
                {item.numbering}
              </span>
              <span className={`line-clamp-2 leading-tight ${compact ? "font-medium" : "font-medium"}`}>
                {item.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
