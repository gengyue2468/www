/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import React, { SVGProps, useEffect, useState } from "react";
import classNames from "classnames";
import { useTheme } from "next-themes";
import { navList } from "./nav.config";
import Menu from "../menu/menu";
import { getButtonStyles, type ThemeConfig } from "./theme.config";
import { useThemeColor } from "./use-theme-color";
import { useTranslation } from "react-i18next";
import { useHash } from "@/hooks/use-hash";

export default function Nav() {
  const { t } = useTranslation();
  const hash = useHash();
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const theme = useThemeColor(currentColor);
  const [openMenu, setOpenMenu] = useState(false);
  const navRef = React.useRef<HTMLDivElement>(null);

  // 计算当前应该使用的主题配色
  const calculateColor = React.useCallback(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const getNavBottom = () => {
      const rect = navElement.getBoundingClientRect();
      return rect.bottom;
    };

    const navBottom = getNavBottom();
    const elements = document.querySelectorAll("[data-color]");
    let bestMatch: { element: Element; distance: number } | null = null;

    for (const element of Array.from(elements)) {
      const rect = element.getBoundingClientRect();

      if (navBottom >= rect.top && navBottom <= rect.bottom) {
        const distance = navBottom - rect.top;

        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = { element, distance };
        }
      }
    }

    if (bestMatch) {
      const color = bestMatch.element.getAttribute("data-color");
      setCurrentColor(color);
    } else {
      setCurrentColor(null);
    }
  }, []);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const getNavHeight = () => {
      return navElement.offsetHeight;
    };

    const handleScroll = () => {
      calculateColor();
    };
    const navHeight = getNavHeight();
    const observer = new IntersectionObserver(
      (entries) => {
        handleScroll();
      },
      {
        root: null,
        rootMargin: `-${navHeight}px 0px 0px 0px`,
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
      }
    );

    const elements = document.querySelectorAll("[data-color]");
    elements.forEach((el) => observer.observe(el));

    calculateColor();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    // Listen to hash changes to update color immediately
    window.addEventListener("hashchange", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", handleScroll);
      observer.disconnect();
    };
  }, [calculateColor]);

  // Recalculate color when hash changes
  useEffect(() => {
    calculateColor();
  }, [hash, calculateColor]);

  const btnStyles = getButtonStyles(theme);

  return (
    <div ref={navRef} className="fixed top-3 w-full z-50">
      <div className="flex flex-row justify-between items-center px-4 w-full">
        <div className="flex flex-row items-center gap-2">
          <Link
            href="/"
            className={classNames(btnStyles, "flex items-center text-base")}
          >
            <span className="text-base">Yue Geng</span>
          </Link>
          {navList.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(btnStyles, "flex items-center text-base")}
            >
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <Menu open={openMenu} onOpenChange={setOpenMenu}>
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className={classNames(
              "flex items-center gap-2",
              openMenu ? getButtonStyles(theme, true) : btnStyles
            )}
          >
            <MenuIcon className="w-5 h-5" />
            <span>{t("nav.menu")}</span>
          </button>
        </Menu>

      </div>
    </div>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3.75 9h16.5m-16.5 6.75h16.5"
      />
    </svg>
  );
}
