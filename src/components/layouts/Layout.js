import Head from "next/head";
import ThemeAwareCodeHighlight from "@/lib/ThemeAwareCodeHighlight";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Layout({ title, children }) {
  const [timeNow, setTimeNow] = useState("");

  moment.locale("zh-cn");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeNow(moment().format("YYYY 年 MM 月 DD 日 dddd HH:mm:ss "));
    }, 500);

    return () => clearInterval(timer);
  }, []);
  return (
    <div className="">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col justify-start min-h-[90vh]">
        <main className="smooth-scroll flex-1">{children}</main>
        <footer className="mt-8 text-center font-bold">
          <p className="mt-4">
            {timeNow}
          </p>
          <p className="mt-4 text-xs opacity-50">© 2025 保留所有权利</p>
        </footer>
      </div>
    </div>
  );
}
