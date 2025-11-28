/* eslint-disable react-hooks/immutability */
"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { menuStyles, menuItems, socialLinks } from "./menu.config";
import Link from "next/link";

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
      const oldHash = window.location.hash;
      window.location.hash = hash;
      
      if (oldHash === `#${hash}`) {
        window.dispatchEvent(new HashChangeEvent("hashchange", {
          oldURL: window.location.href,
          newURL: window.location.href
        }));
      }
      
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 10);
      
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
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}