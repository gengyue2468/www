export default function Wrapper({ children }) {
  return (
    <div
      className="scroll-smooth max-w-none mt-8 prose dark:prose-invert *:text-black! dark:*:text-white! 
    prose-neutral prose-sm  prose-p:text-black dark:prose-p:text-white prose-p:my-8 
    prose-headings:text-lg sm:prose-headings:text-xl prose-headings:mt-12 prose-headings:mb-4 prose-headings:font-semibold 
    prose-pre:mono prose-a:underline-offset-4 
    *:transition-all *:duration-300 
    prose-li:pl-0 prose-li:[&::marker]:pl-0.5 prose-li:[&::marker]:text-black dark:prose-li:[&::marker]:text-white 
    prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-blockquote:-translate-x-5  prose-blockquote:not-italic prose-blockquote:font-medium
    prose-li:text-black dark:prose-li:text-white prose-li:-translate-x-7 prose-li:opacity-100! prose-li:[&::marker]:font-medium 
    prose-strong:font-medium
    prose-pre:rounded-none sm:prose-pre:rounded-sm prose-pre:bg-white dark:prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-code:text-black! dark:prose-code:text-white! prose-pre:-translate-x-8 prose-pre:w-[calc(100%+4rem)]! prose-pre:overflow-x-auto"
    >
      {children}
    </div>
  );
}
