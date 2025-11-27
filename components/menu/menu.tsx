"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { menuStyles, menuItems, socialLinks } from "./menu.config";
import Link from "next/link";
import LanguageSwitcher from "../i18n/language-switcher";

interface MenuProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Menu({ children, open, onOpenChange }: MenuProps) {
  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const hash = href.split("#")[1];
    if (hash) {
      // Update URL hash directly - this will trigger hashchange event automatically
      const oldHash = window.location.hash;
      window.location.hash = hash;
      
      // If hash didn't change (same hash), manually trigger update
      if (oldHash === `#${hash}`) {
        // Force a hashchange event
        window.dispatchEvent(new HashChangeEvent("hashchange", {
          oldURL: window.location.href,
          newURL: window.location.href
        }));
      }
      
      // Scroll to element
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 10);
      
      // Close menu
      onOpenChange?.(false);
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={menuStyles.panel} sideOffset={5}>
          <DropdownMenu.Group>
            <DropdownMenu.Item asChild>
              <Link href="/" className={menuStyles.item}>
                Home
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator className={menuStyles.separator} />
          <DropdownMenu.Group>
            {menuItems.map((item) => (
              <DropdownMenu.Item key={item.name} asChild>
                <a
                  href={item.href}
                  className={menuStyles.item}
                  onClick={(e) => handleHashLink(e, item.href)}
                >
                  {item.name}
                </a>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
          <DropdownMenu.Separator className={menuStyles.separator} />
          <DropdownMenu.Group>
            {socialLinks.map((item) => (
              <DropdownMenu.Item key={item.name} asChild>
                <Link href={item.href} className={menuStyles.item}>
                  {item.name}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
          <DropdownMenu.Separator className={menuStyles.separator} />
          <DropdownMenu.Group>
            <DropdownMenu.Item asChild>
              <LanguageSwitcher />
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}