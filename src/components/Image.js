import NextImage from "next/image";

export default function Image({ alt, src, aspectRatio = 16/9, ...props }) {
  return (
    <div className="my-12 -translate-x-8 not-prose">
      {/* 使用padding-bottom技巧创建响应式比例容器 */}
      <div className="relative bg-neutral-100 dark:bg-neutral-900 rounded-none sm:rounded-3xl w-[calc(100%+4rem)] overflow-hidden">
        {/* 比例容器 - 关键修复 */}
        <div 
          className="relative w-full"
          style={{ paddingBottom: `${100 / aspectRatio}%` }}
        >
          <NextImage
            alt={alt || "图片内容"}
            src={src}
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="w-full h-full rounded-none sm:rounded-3xl object-cover"
            {...props}
          />
        </div>
      </div>

      {alt && (
        <div className="ml-8 mt-4 opacity-50 font-medium text-sm">{alt}</div>
      )}
    </div>
  );
}
