export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center">
      <div className="flex flex-col">
        <h1 className="font-semibold">Geng Yue</h1>
        <p className="font-medium text-neutral-600 dark:text-neutral-400">
          CS Student, HUST
        </p>
      </div>
      <h2 className="font-medium ">中国 · 武汉</h2>
    </header>
  );
}
