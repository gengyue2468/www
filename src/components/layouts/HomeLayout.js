import Head from "next/head";
import HomeNavbar from "../ui/HomeNavbar";

export default function HomeLayout({ title, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="flex items-center justify-center h-screen">{children}</main>
    </div>
  );
}
