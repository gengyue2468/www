export default function Wrapper({ children }) {
  return (
    <div className="max-w-none mt-8 prose dark:prose-invert prose-neutral prose-lg sm:prose-xl leading-loose prose-p:text-black dark:prose-p:text-white prose-p:my-8 prose-headings:text-xl sm:prose-headings:text-2xl prose-headings:my-12 prose-headings:font-semibold">
      {children}
    </div>
  );
}
