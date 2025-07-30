import { site } from "@/lib/site.config";
import Layout from "@/components/Layout";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function About() {
  return (
    <Layout title="他的简介">
      <div>
        <h1 className="leading-relaxed text-balance text-3xl sm:text-6xl font-semibold">
          <span className="serif">他是 一*个人</span>
          <br />
          <span className="serif">他是 一个*人</span>
          <br />
          <span className="serif">他是 一个人*</span>
        </h1>
        <div className="flex flex-row space-x-4 justify-between items-center text-balance">
          <div className="w-2/3">
            <h2 className="text-lg sm:text-3xl mt-4 font-medium">
              他首先是一个人，然后是[一个人]
            </h2>
          </div>
          <div className="w-1/3">
            <LazyLoadImage
              effect="blur"
              alt="Chris Griffin"
              src={`${site.cdn}/static/chris-griffin.webp`}
              className="rounded-full size-24 sm:size-54 object-cover object-center"
            />
          </div>
        </div>

        <h3 className="opacity-50 mt-8">- 标注*和[]的位置表示需要思考的位置</h3>
        <h3 className="opacity-50 mt-4">- cs学院的人不一定是cs</h3>
      </div>
    </Layout>
  );
}
