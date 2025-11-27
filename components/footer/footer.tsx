"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { menuItems } from "../menu/menu.config";

export default function Footer() {
  const [buildTime, setBuildTime] = useState<string | null>(null);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetch('/build-info.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.buildTime) setBuildTime(data.buildTime);
      })
      .catch(() => {
      });
  }, []);

  return (
    <footer className="flex flex-col md:flex-row flex-wrap gap-2 items-center justify-between px-8 pt-16 pb-4">
      <button onClick={handleBackToTop}>Back to top ↑</button>
      <span>© 2025 Yue Geng. All rights reserved.</span>
      <span>
        Site last build: {buildTime ? new Date(buildTime).toLocaleString() : 'No build time reported'}
      </span>
      <div className="flex flex-row items-center gap-4 flex-wrap mt-4 md:mt-0">
        <Link href="/">Home</Link>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href}>
            {item.name}
          </Link>
        ))}
      </div>
    </footer>
  );
}
