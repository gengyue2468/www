import { useState, useEffect, useRef } from "react";

export default function Image({ alt, src, ...props }) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    let intervalId = null;

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

    if (img.complete && img.naturalWidth > 0) {
      checkDimensions();
      return;
    }

    observerRef.current = new ResizeObserver(() => {
      if (checkDimensions()) {
        observerRef.current.disconnect();
      }
    });

    observerRef.current.observe(img);

    intervalId = setInterval(checkDimensions, 100);

    const handleLoad = () => checkDimensions();
    img.addEventListener("load", handleLoad);

    return () => {
      clearInterval(intervalId);
      observerRef.current?.disconnect();
      img.removeEventListener("load", handleLoad);
    };
  }, [src]);

  return (
    <span className="block my-12 not-prose">
      <span
        className={`
      block -translate-x-8 w-[calc(100%+4rem)] relative bg-neutral-100 dark:bg-neutral-900 rounded-none sm:rounded-3xl min-h-48 sm:min-h-[24rem] border-y sm:border border-neutral-200 dark:border-neutral-800
      overflow-hidden
      transition-all duration-500
    `}
      >
        <span className="block relative">
          <img
            ref={imgRef}
            alt={alt || "图片内容"}
            src={src}
            className={`
          w-full h-full object-cover rounded-none sm:rounded-3xl
          transition-opacity duration-500
          ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
            {...props}
          />
        </span>
      </span>
      <span className="flex flex-row mt-4 justify-between items-center">
        {alt && (
          <span className="block opacity-50 text-xs transition-all duration-500">
            {alt}
          </span>
        )}
      </span>
    </span>
  );
}
