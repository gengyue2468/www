import { NowIcon, PaintIcon, UserIcon, WhimIcon } from "@/components/Icon";

const site = {
  NavItems: [
    {
      icon: <WhimIcon />,
      name: "随想",
      href: "/whims",
    },
    {
      icon: <UserIcon />,
      name: "关于",
      href: "/about",
    },
    {
      icon: <NowIcon />,
      name: "现状",
      href: "/now",
    },
    {
      icon: <PaintIcon />,
      name: "设计",
      href: "/design",
    },
  ],
};

export { site };
