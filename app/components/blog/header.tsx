export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center mb-6">
      <div className="flex flex-col">
        <h1 className="font-semibold">博客</h1>
        <p className="font-medium text-neutral-600 dark:text-neutral-400">
          一些有意思或者没意思的东西
        </p>
      </div>
    </header>
  );
}
