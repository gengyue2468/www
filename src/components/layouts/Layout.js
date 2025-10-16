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
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-3xl mx-auto px-8 py-4">
        <main className="smooth-scroll">{children}</main>{" "}
        <footer className="mt-8">
          <h1 className="mt-8 mb-4">您知道吗？</h1>
          <p className="mt-4">
            <span className="font-medium">您现在的时间是：</span>
            {timeNow}
          </p>
          <p className="mt-4 text-xs opacity-50">© 2025 保留所有权利</p>
        </footer>
      </div>
    </div>
  );
}
