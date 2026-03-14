"use client";

import MobileNav from "../ui/mobile-nav";

const navItems = [
  { name: "主页", href: "/", type: "internal" as const },
  { name: "关于", href: "/about", type: "internal" as const },
  { name: "博客", href: "/blog", type: "internal" as const },
  { name: "Email", href: "mailto:hi@gengyue.site", type: "external" as const },
  {
    name: "GitHub",
    href: "https://www.github.com/gengyue2468",
    type: "external" as const,
  },
  {
    name: "Shitposts",
    href: "https://www.shitposts.org",
    type: "external" as const,
  },
  { name: "RSS", href: "/rss.xml", type: "others" as const },
  { name: "Sitemap", href: "/sitemap.xml", type: "others" as const },
  { name: "llms.txt", href: "/llms.txt", type: "others" as const },
];

const NAV_LINK_CLASS =
  "flex flex-row items-center justify-between gap-2 rounded-sm px-3 py-px font-medium hover:bg-surface";

const EXTERNAL_ICON_CLASS = "size-4";

function InternalNavLink({ item }: { item: { name: string; href: string } }) {
  return (
    <a href={item.href} className={NAV_LINK_CLASS}>
      {item.name}
    </a>
  );
}

function ExternalNavLink({ item }: { item: { name: string; href: string } }) {
  return (
    <a
      key={item.href}
      href={item.href}
      className={NAV_LINK_CLASS}
      target="_blank"
      rel="noopener noreferrer"
    >
      {item.name}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={EXTERNAL_ICON_CLASS}
        aria-hidden="true"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
      <span className="sr-only">（外部链接）</span>
    </a>
  );
}

function OtherNavLink({ item }: { item: { name: string; href: string } }) {
  return (
    <a href={item.href} className={NAV_LINK_CLASS}>
      {item.name}
    </a>
  );
}

export default function Navigation() {
  const internalNavItems = navItems.filter((item) => item.type === "internal");
  const externalNavItems = navItems.filter((item) => item.type === "external");
  const otherNavItems = navItems.filter((item) => item.type === "others");

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:text-text focus:shadow-md focus:outline-2 focus:outline-offset-2"
      >
        跳转到主内容
      </a>
      <nav
        aria-label="主导航"
        className="flex flex-col gap-0 absolute md:fixed top-4 md:top-0 right-0 md:left-0 px-0 py-0 md:px-2 md:py-8 w-fit"
      >
        <section className="hidden md:block">
          <div className="flex flex-col gap-0">
            {internalNavItems.map((item) => (
              <InternalNavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-0">
            {externalNavItems.map((item) => (
              <ExternalNavLink key={item.href} item={item} />
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-0">
            {otherNavItems.map((item) => (
              <OtherNavLink key={item.href} item={item} />
            ))}
          </div>
        </section>
        <section className="flex md:hidden justify-end py-3 pr-8">
          <MobileNav nav={navItems} />
        </section>
      </nav>
    </>
  );
}
