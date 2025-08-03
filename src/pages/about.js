import { site } from "@/lib/site.config";
import Layout from "@/components/Layout";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function About() {
  return (
    <Layout title="简介">
      <div className="flex flex-row space-x-4 justify-between items-center text-balance">
        <div className="w-2/3">
         <p>嗨！你好啊👋</p>
         <p className="mt-2">懒蛋🥚一枚，目前在HUST念计算机科学与技术的大一（理论上）</p>
         <p className="mt-2">平时搞搞电脑，玩玩PvZ，就这么过下去...</p>
        </div>
        <div className="w-1/3">
          <LazyLoadImage
            effect="blur"
            alt="Chris Griffin"
            src={`${site.cdn}/static/chris-griffin.webp`}
            className="rounded-full size-24 sm:size-54 object-cover object-center"
          />
          <small>你猜为啥我要用Chris Griffin的照片...</small>
        </div>
      </div>
       <small className="mt-4">若有需要可发邮件至邮箱📫: gengyue2468@outlook.com</small>
    </Layout>
  );
}
