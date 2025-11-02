import { useRouter } from "next/router";
import HomeNavButton from "./HomeNavButton";
import NavButton from "./NavButton";

export default function HomeNavbar() {
  const nav = [
    {
      title: "说明书",
      href: "/about",
    },
    {
      title: "博客文章",
      href: "/blog",
    },
    {
      title: "联系我",
      href: "/contact",
    },
  ];

  const router = useRouter();
  return (
    <div className="fixed w-full top-0 bg-neutral-100 dark:bg-neutral-900 z-21">
      <div className="px-4 md:px-8 py-4 flex flex-row justify-between w-full items-center max-w-xs mx-auto">
        {nav.map((nav, index) => (
          <HomeNavButton key={index} onClick={() => router.push(nav.href)}>
            {nav.title}
          </HomeNavButton>
        ))}
      </div>
    </div>
  );
}
