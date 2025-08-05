import { LazyLoadImage } from "react-lazy-load-image-component";
import { useEffect, useRef, useState } from "react";

export default function Image({ alt, src, ...props }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const handleLoad = () => {
      setIsPageLoaded(true);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div className="my-12 -translate-x-6 not-prose">
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-none sm:rounded-3xl w-[calc(100%+3rem)] h-full overflow-hidden p-0! leading-0 min-h-64 transition-all duration-500">
        <LazyLoadImage
          ref={imgRef}
          alt={alt || "图片内容"}
          src={src}
          threshold={0}
          visible={isPageLoaded}
          effect="opacity"
          className="w-full h-full rounded-none sm:rounded-3xl object-cover"
          {...props}
        />
      </div>

      {alt && <div className="ml-6 mt-4 opacity-50 font-medium text-sm">{alt}</div>}
    </div>
  );
}
