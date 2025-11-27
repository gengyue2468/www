"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook to get and listen to URL hash changes
 * Works with Next.js router and browser navigation
 */
export function useHash(): string {
  const [hash, setHash] = useState<string>("");
  const pathname = usePathname();
  const hashRef = useRef<string>("");

  const getHash = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.slice(1); // Remove the '#'
    }
    return "";
  }, []);

  const updateHash = useCallback(() => {
    const currentHash = getHash();
    if (currentHash !== hashRef.current) {
      hashRef.current = currentHash;
      setHash(currentHash);
    }
  }, [getHash]);

  useEffect(() => {
    // Get initial hash
    updateHash();

    // Listen to hash changes
    const handleHashChange = () => {
      updateHash();
    };

    // Listen to browser hashchange event
    window.addEventListener("hashchange", handleHashChange);
    // Also listen to popstate for browser back/forward
    window.addEventListener("popstate", handleHashChange);

    // Check hash periodically (fallback for cases where events don't fire)
    const intervalId = setInterval(updateHash, 50);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
      clearInterval(intervalId);
    };
  }, [updateHash]);

  // Also check hash when pathname changes (Next.js router navigation)
  useEffect(() => {
    updateHash();
  }, [pathname, updateHash]);

  return hash;
}

