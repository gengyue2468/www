import Head from "next/head";
import Topbar from "./Topbar";
import ThemeAwareCodeHighlight from "@/lib/ThemeAwareCodeHighlight";

export default function Layout({ title, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="bg-neutral-100 dark:bg-neutral-900 text-center py-2">
        <p className="text-xs opacity-50">新的设计正处于测试中 🔥🔥🔥</p>
      </div>
      <Topbar />
      <div className="max-w-3xl mx-auto px-8 py-4">
        <ThemeAwareCodeHighlight />
        <main>{children}</main>{" "}
        <footer className="mt-8">
          <p className="text-xs opacity-50">© 2025 保留所有权利</p>
        </footer>
      </div>
    </div>
  );
}
