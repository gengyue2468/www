import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

function getImageFormats(src: string): { avif?: string; webp?: string; fallback: string } {
  const extension = src.match(/\.(webp|avif|jpe?g|png)$/i)?.[1]?.toLowerCase();
  const basePath = src.replace(/\.(webp|avif|jpe?g|png)$/i, "");
  
  // 如果原图已经是现代格式，不生成额外的source
  if (extension === 'webp') {
    return {
      webp: src,
      fallback: src,
    };
  }
  
  if (extension === 'avif') {
    return {
      avif: src,
      fallback: src,
    };
  }
  
  // 对于jpg/png等传统格式，生成现代格式的路径
  return {
    avif: `${basePath}.avif`,
    webp: `${basePath}.webp`,
    fallback: src,
  };
}

export function Image({
  src,
  alt = "",
  className = "",
  loading = "lazy",
}: OptimizedImageProps) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const layoutId = `image-${src}`;
  const formats = getImageFormats(src);

  // 单一的加载处理函数
  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img || img.naturalWidth === 0) return;

    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight,
    });
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    // picture标签会自动降级：avif失败→webp→fallback
    // 只有所有格式都失败时才会触发img的onError
    setHasError(true);
  };

  // 监听 src 变化时重置状态
  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }
    setIsLoaded(false);
    setDimensions(null);
    setHasError(false);
  }, [src]);

  // 检查图片是否已经从缓存加载完成
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 如果图片已经加载完成（从缓存），onLoad可能不会触发
    if (img.complete && img.naturalWidth > 0) {
      handleImageLoad();
    }
  }, [src]);

  // 处理全屏模式下的 Escape 键
  useEffect(() => {
    if (!fullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (hasError) {
    return (
      <span
        className={`bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center ${className}`}
        style={{
          display: "block",
          aspectRatio: dimensions?.aspectRatio || 16 / 9,
          minHeight: "200px",
        }}
      >
        <span className="text-neutral-500 dark:text-neutral-400 text-sm">
          图片加载失败
        </span>
      </span>
    );
  }

  return (
    <>
      <AnimatePresence>
        {fullscreen && (
          <motion.span
            key="fullscreen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="block fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            <motion.img
              layoutId={layoutId}
              src={imgRef.current?.currentSrc || formats.fallback}
              alt={alt}
              className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(false);
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>

      <span
        className="relative overflow-hidden -mx-8 md:mx-0 w-[calc(100%+4rem)] md:w-full block"
        style={{
          aspectRatio: dimensions?.aspectRatio || undefined,
          minHeight: dimensions ? undefined : "200px",
        }}
      >
        {(!isLoaded || !dimensions) && (
          <span
            className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 block"
            style={{
              aspectRatio: dimensions?.aspectRatio || undefined,
              minHeight: dimensions ? undefined : "200px",
            }}
          >
            <span className="w-full h-full bg-neutral-200 dark:bg-neutral-800 animate-pulse block" />
          </span>
        )}

        <picture className="contents">
          {formats.avif && (
            <source srcSet={formats.avif} type="image/avif" />
          )}
          {formats.webp && (
            <source srcSet={formats.webp} type="image/webp" />
          )}
          <motion.img
            ref={imgRef}
            layoutId={layoutId}
            src={formats.fallback}
            alt={alt}
            loading={loading}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`h-full object-cover w-full ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${fullscreen ? "cursor-zoom-out" : "cursor-zoom-in"} ${className}`}
            onClick={() => setFullscreen(!fullscreen)}
            style={{
              aspectRatio: dimensions?.aspectRatio || undefined,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        </picture>
      </span>
    </>
  );
}
