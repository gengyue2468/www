"use client";

import { useEffect } from "react";
import "@/i18n/config";

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
  }, []);

  return <>{children}</>;
}

