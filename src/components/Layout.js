import { NextSeo } from "next-seo";
import Nav from "./Nav";
import { useRouter } from "next/router";
import Cmdk from "./Cmdk";
import { site } from "@/lib/site.config";
import ThemeAwareCodeHighlight from "./ThemeAwareCodeHighlight";

export default function Layout({ title, desc, children }) {
  const router = useRouter();
  return (
    <div className="">
    
      <NextSeo
        title={router.asPath === "/" ? title : `${title} | ${site.author} 's site`}
        description={desc}
        canonical={`${site.deployURL}/${router.asPath}`} // 规范链接，避免重复内容问题
        openGraph={{
          title,
          description: desc,
          url: `${site.deployURL}/${router.asPath}`,
          siteName: `${site.author} 's site`,
          type: "website",
          images: [
            {
              url: "/static/author.webp",
              width: 568,
              height: 568,
              alt: "头像",
            },
          ],
        }}
      />
  <ThemeAwareCodeHighlight />
      <div className="max-w-2xl mx-auto py-16 sm:py-32 px-8 z-0 overflow-visible">
        <div className="flex flex-row justify-between items-center">
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer flex flex-row space-x-4 text-sm sm:text-base items-center font-medium"
          >
            <img
              src="/static/author.webp"
              alt="头像"
              className="object-center rounded-full size-8 border border-neutral-100 dark:border-neutral-900"
            />
            <span className="">
              {site.author}
            </span>
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
