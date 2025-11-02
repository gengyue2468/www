export default function MdxWrapper({ children }) {
  return (
    <>
      <div className="prose prose-neutral dark:prose-invert">
        {children}
      </div>
  
    </>
  );
}
