import { NextSeo } from "next-seo";
import Nav from "./Nav";
import { useRouter } from "next/router";
import Cmdk from "./Cmdk";

export default function Layout({ title, desc, children }) {
  const router = useRouter();
  return (
    <div className="">
      <NextSeo
        title={title}
        description={desc}
        canonical={`https://ded.huster.fun/${router.asPath}`} // 规范链接，避免重复内容问题
        openGraph={{
          title,
          description: desc,
          url: `https://ded.huster.fun/${router.asPath}`,
          siteName: "狗子吃饺子的网站",
          type: "website",
          images: [
            {
              url: "/static/author.webp",
              width: 568,
              height: 568,
              alt: "狗饺头像",
            },
          ],
        }}
      />

      <div className="max-w-2xl mx-auto py-16 sm:py-32 px-8 z-0 overflow-visible">
        <div className="flex flex-row justify-between items-center">
          <div onClick={() => router.push("/")} className="cursor-pointer ">
            <img
              src="/static/author.webp"
              alt="狗饺头像"
              className="object-center rounded-full size-6 sm:size-8 border border-neutral-100 dark:border-neutral-900"
            />
          </div>
          <div>
            <Cmdk />
          </div>
        </div>

        <main className="mt-8 scroll-smooth">{children}</main>

        <div className="mt-32">
          <Nav />
        </div>

        <footer className="mt-32 font-medium text-xs sm:text-sm opacity-50 flex flex-col space-y-1.5">
          <p>
            Copyright © <span className="">{new Date().getFullYear()}</span>{" "}
            保留所有权利.
          </p>
        </footer>
      </div>
    </div>
  );
}
