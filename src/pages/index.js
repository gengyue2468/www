import { site } from "@/lib/site.config";
import Layout from "@/components/Layout";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Home() {
  return (
    <Layout title="耿越是一名华中科技大学计算机科学与技术专业的学生">
      <div>
        <h1 className="leading-relaxed text-balance text-3xl sm:text-6xl font-semibold">
          <span className="serif mr-2 transition-all duration-300">
            耿越 是一名
            <a
              className="flex items-center hover:opacity-75 transition-all duration-300"
              href="https://hust.edu.cn"
            >
              <LazyLoadImage
                src={`${site.cdn}/static/sign/hust.png`}
                className="h-10 sm:h-18 rounded-full mr-1"
                effect="blur"
                alt="华中科技大学"
              />
              华中科技大学
            </a>
            <a
              className="flex items-center hover:opacity-75 transition-all duration-300"
              href="http://www.cs.hust.edu.cn/"
            >
              计算机科学与技术专业
            </a>
            的大一新生
          </span>
        </h1>
        <div className="flex flex-row space-x-4 justify-between items-center text-balance">
          <div className="w-2/3">
            <h2 className="text-lg sm:text-3xl mt-4 font-medium">
              这是他的个人网站
            </h2>
          </div>
          <div className="w-1/3">
            <LazyLoadImage
              alt="logo"
              effect="blur"
              src={`${site.cdn}/static/author.webp`}
              className="rounded-full size-24 sm:size-54 object-cover object-center"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
