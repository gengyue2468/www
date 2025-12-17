import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function OptimizedImage({
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

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }

    setDimensions(null);
    setIsLoaded(false);
    setHasError(false);

    const img = new Image();

    const handleLoad = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio,
        });
      }
    };

    const handleError = () => {
      setHasError(true);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const checkLoaded = () => {
      if (img.complete && img.naturalWidth > 0) {
        setIsLoaded(true);
        if (!dimensions) {
          setDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          });
        }
      }
    };

    checkLoaded();

    const timeoutId = setTimeout(checkLoaded, 100);

    img.addEventListener("load", checkLoaded);

    return () => {
      clearTimeout(timeoutId);
      img.removeEventListener("load", checkLoaded);
    };
  }, [src, dimensions]);

  const handleLoad = () => {
    const img = imgRef.current;
    if (img && img.naturalWidth > 0) {
      setIsLoaded(true);
      if (!dimensions) {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });
      }
    }
  };

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
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl rounded-lg"
              onClick={()=> setFullscreen(false)}
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

        <motion.img
          ref={imgRef}
          layoutId={layoutId}
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          className={`h-full object-cover ${
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
      </span>
    </>
  );
}
