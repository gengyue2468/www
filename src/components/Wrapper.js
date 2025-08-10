export default function Wrapper({ children }) {
  return (
    <div className="max-w-none mt-8 prose dark:prose-invert *:text-black! dark:*:text-white! 
    prose-neutral prose-base sm:prose-lg prose-p:tracking-wide prose-p:text-black dark:prose-p:text-white prose-p:my-8 
    prose-headings:text-lg sm:prose-headings:text-xl prose-headings:my-12 prose-headings:font-semibold 
    prose-pre:mono prose-a:underline-offset-4 
    *:transition-all *:duration-300 
    prose-li:pl-0 prose-li:[&::marker]:mr-0.5 prose-li:[&::marker]:text-black dark:prose-li:[&::marker]:text-white 
    prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-blockquote:-translate-x-5  prose-blockquote:not-italic 
    prose-li:text-black dark:prose-li:text-white prose-li:-translate-x-7 prose-li:opacity-100!">
      {children}
    </div>
  );
}
