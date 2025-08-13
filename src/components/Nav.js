import Link from "next/link";
import { SegmentContainer, SegmentItem } from "./SegmentControl";

const NavItems = [
  {
    name: "随想",
    href: "/thoughts",
  },
  {
    name: "关于",
    href: "/about",
  },
  {
    name: "现状",
    href: "/now",
  },
  {
    name: "设计",
    href: "/design",
  },
];

const Nav = () => {
  return (
    <SegmentContainer className="relative -translate-x-3 inline-flex! flex-col group">
      {NavItems.map((item, index) => (
        <SegmentItem className="py-2" key={index}>
          <Link
            href={item.href}
            className="relative z-10 py-2 px-3 rounded-lg transition-all duration-300 ease-out font-medium text-sm sm:text-base
                     group-hover:opacity-50 hover:opacity-100"
          >
            {item.name}
          </Link>
        </SegmentItem>
      ))}
    </SegmentContainer>
  );
};

export default Nav;
