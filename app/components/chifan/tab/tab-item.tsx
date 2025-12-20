interface TabItemProps {
  name: string;
  value: number;
  isSelected: boolean;
  onSelect: (value: number) => void;
}

export default function TabItem({
  name,
  value,
  isSelected,
  onSelect,
}: TabItemProps) {
  return (
    <button
      key={value}
      className={` ${
        isSelected
          ? "font-semibold border-b-2 border-neutral-300 dark:border-neutral-700"
          : "font-medium border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      }`}
      onClick={() => onSelect(value)}
    >
      {name}
    </button>
  );
}
