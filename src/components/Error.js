import { site } from "@/lib/site.config";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Error({ error, type }) {
  const router = useRouter();
  return (
    <div className="my-4">
      <h1 className="leading-relaxed">
        <span className="text-balance mr-2 transition-all duration-300 text-3xl sm:text-4xl font-semibold leading-relaxed">
          糟糕！
          <br />
          <span>我们遇上了点小问题.</span>
          <br />
          不必担心，我们能解决.
        </span>
      </h1>
      <div className="flex flex-row space-x-4 justify-between items-center text-balance">
        <div className="w-2/3">
          <h2 className="mt-4 font-medium">
            {error}
          </h2>
        </div>
        <div className="w-1/3">
          <LazyLoadImage
            alt="Brian Griffin"
            effect="opacity"
            src={`${site.cdn}/static/brian-griffin.webp`}
            className="rounded-full size-24 sm:size-54 object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
