import { useRef, useEffect, useState } from "react";
import Link from "next/link";

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
  const navContainerRef = useRef(null);
  const sliderRef = useRef(null);
  const linkRefs = useRef([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (sliderRef.current && !isHovering) {
      sliderRef.current.style.opacity = "0";
    }
  }, [isHovering]);

  useEffect(() => {
    if (linkRefs.current[0] && sliderRef.current) {
      const firstLink = linkRefs.current[0];
      const { top, height } = firstLink.getBoundingClientRect();
      const containerTop = navContainerRef.current.getBoundingClientRect().top;

      sliderRef.current.style.top = `${top - containerTop}px`;
      sliderRef.current.style.height = `${height}px`;
    }
  }, []);

  const handleMouseEnter = (index) => {
    setIsHovering(true); 
    if (!sliderRef.current || !linkRefs.current[index]) return;

    const targetLink = linkRefs.current[index];
    const containerRect = navContainerRef.current.getBoundingClientRect();
    const targetRect = targetLink.getBoundingClientRect();

    const top = targetRect.top - containerRect.top;
    const height = targetRect.height;

    sliderRef.current.style.top = `${top}px`;
    sliderRef.current.style.height = `${height}px`;
    sliderRef.current.style.opacity = "1"; 
  };

  const handleContainerLeave = () => {
    setIsHovering(false); 
    if (sliderRef.current) {
      sliderRef.current.style.opacity = "0";
    }
  };

  return (
    <div 
      ref={navContainerRef} 
      className="relative inline-flex flex-col group"
      onMouseLeave={handleContainerLeave}
    >
      <div
        ref={sliderRef}
        className="absolute -left-3 right-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-out z-0"
        style={{ opacity: 0 }}
      />

      {NavItems.map((item, index) => (
        <Link
          key={item.name}
          href={item.href}
          ref={(el) => (linkRefs.current[index] = el)}
          onMouseEnter={() => handleMouseEnter(index)}
          className="relative z-10 py-2 px-3 -translate-x-3 rounded-lg transition-all duration-300 ease-out font-medium text-sm sm:text-base
                     group-hover:opacity-50 hover:opacity-100"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default Nav;

