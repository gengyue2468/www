"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getTheme, type ThemeConfig } from "./theme.config";

/**
 * 获取当前应该使用的主题配色
 * 根据 data-color 属性和系统主题自动调整
 */
export function useThemeColor(dataColor?: string | null): ThemeConfig {
  const { theme: systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(getTheme("auto", "system"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 使用 resolvedTheme 而不是 theme，因为 resolvedTheme 是实际解析后的主题
    const actualTheme = resolvedTheme || systemTheme || "system";
    const newTheme = getTheme(
      dataColor || "auto",
      (actualTheme as "light" | "dark" | "system") || "system"
    );
    setTheme(newTheme);
  }, [mounted, dataColor, systemTheme, resolvedTheme]);

  return theme;
}

/**
 * 获取当前系统主题模式
 * 返回 "light" | "dark" | "system"
 */
export function useSystemThemeMode(): "light" | "dark" | "system" {
  const { theme: systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return "system";
  }

  return (resolvedTheme || systemTheme || "system") as "light" | "dark" | "system";
}

