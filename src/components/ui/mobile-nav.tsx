"use client";
import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { ScrollArea } from "@base-ui/react/scroll-area";

const BACKDROP_MOTION_CLASS =
  "[--backdrop-opacity:1] dark:[--backdrop-opacity:0.7] opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-[backdrop-filter,opacity] duration-[600ms] ease-[var(--ease-out-fast)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[350ms] data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)]";

const VIEWPORT_MOTION_CLASS =
  "transition-[transform,translate] duration-[600ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-starting-style:translate-y-[100dvh] group-data-ending-style:pointer-events-none";

const POPUP_MOTION_CLASS =
  "transition-transform duration-[800ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-swiping:select-none data-ending-style:[transform:translateY(calc(max(100dvh,100%)+2px))] data-ending-style:duration-[350ms] data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)]";

const SCROLLBAR_MOTION_CLASS =
  "pointer-events-none opacity-0 transition-opacity duration-[250ms] data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-[75ms] data-scrolling:delay-[0ms] hover:pointer-events-auto hover:opacity-100 hover:duration-[75ms] hover:delay-[0ms] data-ending-style:opacity-0 data-ending-style:duration-[250ms]";

type InternalNavItem = {
  name: string;
  href: string;
  type: "internal";
};

type ExternalNavItem = {
  name: string;
  href: string;
  type: "external";
};

type OtherNavItem = {
  name: string;
  href: string;
  type: "others";
};

type NavItem = InternalNavItem | ExternalNavItem | OtherNavItem;

const NAV_LINK_CLASS =
  "flex w-full flex-row items-center justify-between gap-1 rounded-sm text-lg px-1 py-px font-medium text-text no-underline hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1";

const EXTERNAL_ICON_CLASS = "size-4";

function MobileInternalNavLink({
  item,
  onClose,
}: {
  item: InternalNavItem;
  onClose: () => void;
}) {
  return (
    <a href={item.href as never} className={NAV_LINK_CLASS} onClick={onClose}>
      {item.name}
    </a>
  );
}

function MobileExternalNavLink({ item }: { item: ExternalNavItem }) {
  return (
    <a
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

function MobileOtherNavLink({ item }: { item: OtherNavItem }) {
  return (
    <a key={item.href} href={item.href} className={NAV_LINK_CLASS}>
      {item.name}
    </a>
  );
}

export default function MobileNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  const internalNavItems = nav.filter(
    (item): item is InternalNavItem => item.type === "internal",
  );
  const externalNavItems = nav.filter(
    (item): item is ExternalNavItem => item.type === "external",
  );

  const othersNavItems = nav.filter(
    (item): item is OtherNavItem => item.type === "others",
  );

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        aria-label="打开导航菜单"
        className="rounded-sm p-px hover:bg-surface flex items-center justify-center z-10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop
          className={`z-20 fixed inset-0 min-h-dvh bg-black/10 backdrop-blur-[2px] supports-[-webkit-touch-callout:none]:absolute data-starting-style:backdrop-blur-0 data-ending-style:backdrop-blur-0 ${BACKDROP_MOTION_CLASS}`}
        />
        <Drawer.Viewport className="z-30 group fixed inset-0">
          <ScrollArea.Root
            style={{ position: undefined }}
            className={`box-border h-full overscroll-contain ${VIEWPORT_MOTION_CLASS}`}
          >
            <ScrollArea.Viewport className="box-border h-full overscroll-contain touch-auto">
              <ScrollArea.Content className="flex min-h-full items-end justify-center pt-2 md:px-6 md:py-8">
                <Drawer.Popup
                  className={`group box-border w-full max-w-xl outline-none ${POPUP_MOTION_CLASS}`}
                >
                  <nav
                    aria-label="Navigation"
                    className="relative flex flex-col rounded-t-md bg-surface px-6 pt-3 pb-32 text-text shadow-[0_10px_64px_-10px_rgb(36_40_52/20%),0_0.25px_0_1px_oklch(12%_9%_264deg/7%)] outline-1 outline-border transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] group-data-ending-style:shadow-[0_10px_64px_-10px_rgb(36_40_52/0%),0_0.25px_0_1px_rgb(0_0_0/0%)] dark:outline-border dark:shadow-[0_0_0_1px_oklch(29%_0.75%_264deg/80%)] dark:group-data-ending-style:shadow-[0_0_0_1px_rgb(0_0_0/0%)] md:rounded-lg"
                  >
                    <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center">
                      <div aria-hidden className="h-8 w-8" />
                      <div className="h-1 w-10 justify-self-center rounded-full bg-border" />
                      <Drawer.Close
                        aria-label="Close menu"
                        className="flex h-8 w-8 items-center justify-center justify-self-end rounded-full border border-border bg-surface text-text hover:bg-surface-hover active:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M0.75 0.75L6 6M11.25 11.25L6 6M6 6L0.75 11.25M6 6L11.25 0.75"
                            stroke="currentcolor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Drawer.Close>
                    </div>

                    <Drawer.Content className="w-full">
                      <Drawer.Title className="sr-only">
                        Navigation
                      </Drawer.Title>
                      <Drawer.Description className="sr-only">
                        Internal links first, then external links.
                      </Drawer.Description>

                      <div className="pb-2">
                        <ul className="m-0 grid list-none gap-0 p-0">
                          {internalNavItems.map((item) => (
                            <li
                              key={item.href}
                              className="flex border-b border-border last:border-0 py-1"
                            >
                              <MobileInternalNavLink
                                item={item}
                                onClose={() => setOpen(false)}
                              />
                            </li>
                          ))}
                        </ul>

                        <ul className="mt-2 m-0 grid list-none gap-0 p-0">
                          {externalNavItems.map((item) => (
                            <li
                              key={item.href}
                              className="flex border-b border-border last:border-0 py-1"
                            >
                              <MobileExternalNavLink item={item} />
                            </li>
                          ))}
                        </ul>

                        <ul className="mt-2 m-0 grid list-none gap-0 p-0">
                          {othersNavItems.map((item) => (
                            <li
                              key={item.href}
                              className="flex border-b border-border last:border-0 py-1"
                            >
                              <MobileOtherNavLink item={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Drawer.Content>
                  </nav>
                </Drawer.Popup>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className={`absolute m-[0.4rem] flex w-1 justify-center rounded-2xl md:w-1 ${SCROLLBAR_MOTION_CLASS}`}
            >
              <ScrollArea.Thumb className="w-full rounded-[inherit] bg-accent before:absolute before:content-[''] before:top-1/2 before:left-1/2 before:h-[calc(100%+1rem)] before:w-[calc(100%+1rem)] before:-translate-x-1/2 before:-translate-y-1/2" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
