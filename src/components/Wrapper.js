export default function Wrapper({ children }) {
  return (
    <div className="max-w-none mt-8 prose dark:prose-invert prose-neutral prose-lg sm:prose-xl prose-p:tracking-wide prose-p:text-black dark:prose-p:text-white prose-p:my-8 prose-headings:text-xl sm:prose-headings:text-2xl prose-headings:my-12 prose-headings:font-semibold prose-pre:mono prose-a:underline-offset-4 prose-a:hover:opacity-75 *:transition-all *:duration-300 prose-li:pl-0 prose-li:[&::marker]:mr-0.5 prose-li:text-black dark:prose-li:text-white prose-li:-translate-x-[1.75rem] sm:prose-li:-translate-x-8 prose-li:opacity-100!">
      {children}
    </div>
  );
}
