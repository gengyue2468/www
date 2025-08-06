export default function Image({ alt, src, ...props }) {
  return (
    <div className="my-12 -translate-x-6 not-prose">
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-none sm:rounded-3xl w-[calc(100%+3rem)] h-full overflow-hidden p-0! leading-0 min-h-64 transition-all duration-500">
        <img
          alt={alt || "图片内容"}
          src={src}
          className="w-full h-full rounded-none sm:rounded-3xl object-cover"
          {...props}
        />
      </div>

      {alt && (
        <div className="ml-6 mt-4 opacity-50 font-medium text-sm">{alt}</div>
      )}
    </div>
  );
}
