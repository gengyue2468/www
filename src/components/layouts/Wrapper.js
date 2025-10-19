export default function Wrapper({ children, className }) {
  return (
    <div
      className={`scroll-smooth max-w-none mt-8 prose dark:prose-invert *:text-black! dark:*:text-white! 
    prose-neutral prose-lg serif prose-p:font-medium prose-p:leading-loose prose-h1:text-2xl prose-h2:text-xl prose-headings:sans prose-p:text-black dark:prose-p:text-white prose-p:my-4
    prose-headings:mt-6 prose-headings:mb-4 prose-headings:!no-underline prose-headings:font-bold 
    prose-pre:px-8 prose-a:underline-offset-4 
    *:transition-all *:duration-300 
    prose-li:pl-0 prose-li:[&::marker]:pl-0.5 prose-li:[&::marker]:text-black dark:prose-li:[&::marker]:text-white 
    prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-blockquote:-translate-x-5  prose-blockquote:not-italic prose-blockquote:font-medium
    prose-li:text-black dark:prose-li:text-white prose-li:-translate-x-7 prose-li:opacity-100! prose-li:[&::marker]:font-medium 
    prose-strong:font-medium
    prose-pre:rounded-none sm:prose-pre:rounded-3xl prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900  prose-code:text-black! dark:prose-code:text-white! prose-pre:-translate-x-8 prose-code:font-mono prose-pre:w-[calc(100%+4rem)]! prose-pre:overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
}
