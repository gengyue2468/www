import { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Image({ alt, src, ...props }) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 清除之前的观察器和定时器
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    let intervalId = null;

    // 尺寸检查函数
    const checkDimensions = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const ratio = img.naturalWidth / img.naturalHeight;
        setAspectRatio(ratio);
        setIsPortrait(ratio < 1);
        setIsLoaded(true);
        clearInterval(intervalId);
        observerRef.current?.disconnect();
        return true;
      }
      return false;
    };

    // 如果图片已加载完成
    if (img.complete && img.naturalWidth > 0) {
      checkDimensions();
      return;
    }

    // 使用 ResizeObserver 监听尺寸变化
    observerRef.current = new ResizeObserver(() => {
      if (checkDimensions()) {
        observerRef.current.disconnect();
      }
    });

    observerRef.current.observe(img);

    // 设置轮询检查作为后备方案
    intervalId = setInterval(checkDimensions, 100);

    // 添加加载事件监听器
    const handleLoad = () => checkDimensions();
    img.addEventListener("load", handleLoad);

    return () => {
      clearInterval(intervalId);
      observerRef.current?.disconnect();
      img.removeEventListener("load", handleLoad);
    };
  }, [src]);

  return (
    <div className="my-12 not-prose">
      <div
        className={`
          relative bg-neutral-100 dark:bg-neutral-900 rounded-none min-h-48 sm:min-h-[24rem]
          ${
            isPortrait
              ? "sm:rounded-3xl w-[calc(100%+4rem)]! -translate-x-8"
              : "sm:rounded-3xl w-[calc(100%+4rem)]! sm:w-[calc(100%+24rem)]! -translate-x-8 sm:-translate-x-48"
          }
          overflow-hidden
          transition-all duration-500
        `}
      >
        <div className="relative">
          <LazyLoadImage
            effect="blur"
            ref={imgRef}
            alt={alt || "图片内容"}
            src={src}
            className={`
              w-full h-full object-cover 
              ${
                isPortrait
                  ? "rounded-none sm:rounded-3xl"
                  : "rounded-none sm:rounded-3xl"
              }
              transition-opacity duration-500
              ${isLoaded ? "opacity-100" : "opacity-0"}
            `}
            {...props}
          />
        </div>
      </div>

      {alt && (
        <div className="mt-4 opacity-50 font-medium text-sm transition-all duration-500">
          {alt}
        </div>
      )}
    </div>
  );
}
