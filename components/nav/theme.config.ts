/**
 * 主题配色方案配置
 * 根据 data-color 属性值应用不同的配色主题
 * 支持格式: "color-mode" 如 "blue-light", "emerald-dark" 等
 */

export type ColorName = "blue" | "emerald" | "pink" | "orange" | "lime";
export type ColorMode = "light" | "dark";
export type ThemeColor =
  | "light"
  | "dark"
  | "auto"
  | `${ColorName}-${ColorMode}`;

export interface ThemeConfig {
  background: string;
  foreground: string;
  btn: {
    default: string;
    hover: string;
    active: string;
  };
  selection: {
    bg: string;
    text: string;
  };
}

// 基础黑白主题
const baseThemes: Record<"light" | "dark" | "auto", ThemeConfig> = {
  light: {
    background: "#ffffff",
    foreground: "#000000",
    btn: {
      default: "bg-white text-black",
      hover: "hover:bg-black hover:text-white",
      active: "bg-black text-white",
    },
    selection: {
      bg: "#000000",
      text: "#ffffff",
    },
  },
  dark: {
    background: "#000000",
    foreground: "#ffffff",
    btn: {
      default: "bg-black text-white",
      hover: "hover:bg-white hover:text-black",
      active: "bg-white text-black",
    },
    selection: {
      bg: "#ffffff",
      text: "#000000",
    },
  },
  auto: {
    // 自动模式，使用 CSS 变量，根据系统主题自动切换
    background: "var(--background)",
    foreground: "var(--foreground)",
    btn: {
      default: "bg-[var(--background)] text-[var(--foreground)]",
      hover: "hover:bg-[var(--foreground)] hover:text-[var(--background)]",
      active: "bg-[var(--foreground)] text-[var(--background)]",
    },
    selection: {
      bg: "var(--foreground)",
      text: "var(--background)",
    },
  },
};

// 彩色主题配置 - 使用 Tailwind CSS 颜色系统
const colorThemes: Record<ColorName, Record<ColorMode, ThemeConfig>> = {
  blue: {
    light: {
      background: "#eff6ff", // blue-50
      foreground: "#1e40af", // blue-800
      btn: {
        default: "bg-blue-50 text-blue-800",
        hover: "hover:bg-blue-800 hover:text-blue-50",
        active: "bg-blue-800 text-blue-50",
      },
      selection: {
        bg: "#1e40af", // blue-800
        text: "#eff6ff", // blue-50
      },
    },
    dark: {
      background: "#1e3a8a", // blue-900
      foreground: "#dbeafe", // blue-100
      btn: {
        default: "bg-blue-900 text-blue-100",
        hover: "hover:bg-blue-100 hover:text-blue-900",
        active: "bg-blue-100 text-blue-900",
      },
      selection: {
        bg: "#dbeafe", // blue-100
        text: "#1e3a8a", // blue-900
      },
    },
  },
  emerald: {
    light: {
      background: "#ecfdf5", // emerald-50
      foreground: "#065f46", // emerald-800
      btn: {
        default: "bg-emerald-50 text-emerald-800",
        hover: "hover:bg-emerald-800 hover:text-emerald-50",
        active: "bg-emerald-800 text-emerald-50",
      },
      selection: {
        bg: "#065f46", // emerald-800
        text: "#ecfdf5", // emerald-50
      },
    },
    dark: {
      background: "#064e3b", // emerald-900
      foreground: "#d1fae5", // emerald-100
      btn: {
        default: "bg-emerald-900 text-emerald-100",
        hover: "hover:bg-emerald-100 hover:text-emerald-900",
        active: "bg-emerald-100 text-emerald-900",
      },
      selection: {
        bg: "#d1fae5", // emerald-100
        text: "#064e3b", // emerald-900
      },
    },
  },
  pink: {
    light: {
      background: "#fdf2f8", // pink-50
      foreground: "#9f1239", // pink-800
      btn: {
        default: "bg-pink-50 text-pink-800",
        hover: "hover:bg-pink-800 hover:text-pink-50",
        active: "bg-pink-800 text-pink-50",
      },
      selection: {
        bg: "#9f1239", // pink-800
        text: "#fdf2f8", // pink-50
      },
    },
    dark: {
      background: "#831843", // pink-900
      foreground: "#fce7f3", // pink-100
      btn: {
        default: "bg-pink-900 text-pink-100",
        hover: "hover:bg-pink-100 hover:text-pink-900",
        active: "bg-pink-100 text-pink-900",
      },
      selection: {
        bg: "#fce7f3", // pink-100
        text: "#831843", // pink-900
      },
    },
  },
  orange: {
    light: {
      background: "#fff7ed", // orange-50
      foreground: "#9a3412", // orange-800
      btn: {
        default: "bg-orange-50 text-orange-800",
        hover: "hover:bg-orange-800 hover:text-orange-50",
        active: "bg-orange-800 text-orange-50",
      },
      selection: {
        bg: "#9a3412", // orange-800
        text: "#fff7ed", // orange-50
      },
    },
    dark: {
      background: "#7c2d12", // orange-900
      foreground: "#ffedd5", // orange-100
      btn: {
        default: "bg-orange-900 text-orange-100",
        hover: "hover:bg-orange-100 hover:text-orange-900",
        active: "bg-orange-100 text-orange-900",
      },
      selection: {
        bg: "#ffedd5", // orange-100
        text: "#7c2d12", // orange-900
      },
    },
  },
  lime: {
    light: {
      background: "#f7fee7", // lime-50
      foreground: "#365314", // lime-800
      btn: {
        default: "bg-lime-50 text-lime-800",
        hover: "hover:bg-lime-800 hover:text-lime-50",
        active: "bg-lime-800 text-lime-50",
      },
      selection: {
        bg: "#365314", // lime-800
        text: "#f7fee7", // lime-50
      },
    },
    dark: {
      background: "#1a2e05", // lime-950 (使用950因为900对比度不够)
      foreground: "#ecfccb", // lime-100
      btn: {
        default: "bg-lime-950 text-lime-100",
        hover: "hover:bg-lime-100 hover:text-lime-950",
        active: "bg-lime-100 text-lime-950",
      },
      selection: {
        bg: "#ecfccb", // lime-100
        text: "#1a2e05", // lime-950
      },
    },
  },
};

// 合并所有主题
export const themes: Record<string, ThemeConfig> = {
  ...baseThemes,
  // 展开所有彩色主题
  ...Object.entries(colorThemes).reduce((acc, [colorName, modes]) => {
    Object.entries(modes).forEach(([mode, config]) => {
      acc[`${colorName}-${mode}`] = config;
    });
    return acc;
  }, {} as Record<string, ThemeConfig>),
};

/**
 * 根据 data-color 值获取对应的主题配置
 * 支持格式: "light", "dark", "auto", "blue-light", "emerald-dark", "blue" 等
 * @param color data-color 属性值
 * @param systemTheme 系统主题模式 ("light" | "dark" | "system")，用于自动调整配色
 */
export function getTheme(
  color?: string | null,
  systemTheme: "light" | "dark" | "system" = "system"
): ThemeConfig {
  if (!color || color === "auto") {
    return themes.auto;
  }

  // 如果指定了完整的配色（如 "blue-light"），直接使用
  if (themes[color]) {
    return themes[color];
  }

  // 如果只指定了颜色名（如 "blue"），根据系统主题自动选择 light 或 dark
  const colorNames: ColorName[] = ["blue", "emerald", "pink", "orange", "lime"];
  if (colorNames.includes(color as ColorName)) {
    // 确定实际的主题模式
    let actualMode: ColorMode = "light";
    if (systemTheme === "dark") {
      actualMode = "dark";
    } else if (systemTheme === "system") {
      // 检测系统偏好
      if (typeof window !== "undefined" && window.matchMedia) {
        actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    }

    const themeKey = `${color}-${actualMode}`;
    if (themes[themeKey]) {
      return themes[themeKey];
    }
  }

  // 如果指定了颜色和模式（如 "blue-light"），但系统主题不同，自动调整
  const colorModeMatch = color.match(/^([a-z]+)-(light|dark)$/);
  if (colorModeMatch) {
    const [, colorName, specifiedMode] = colorModeMatch;
    if (colorNames.includes(colorName as ColorName)) {
      // 确定实际的主题模式
      let actualMode: ColorMode = specifiedMode as ColorMode;
      if (systemTheme === "dark") {
        actualMode = "dark";
      } else if (systemTheme === "light") {
        actualMode = "light";
      } else if (systemTheme === "system") {
        // 检测系统偏好
        if (typeof window !== "undefined" && window.matchMedia) {
          actualMode = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
      }

      const themeKey = `${colorName}-${actualMode}`;
      if (themes[themeKey]) {
        return themes[themeKey];
      }
    }
  }

  return themes.auto;
}

/**
 * 根据主题配置生成按钮样式类名
 */
export function getButtonStyles(theme: ThemeConfig, isActive: boolean = false): string {
  const baseStyles = "px-2 py-0.5 cursor-pointer rounded-xs text-base";
  if (isActive) {
    return `${theme.btn.active} ${baseStyles}`;
  }
  return `${theme.btn.default} ${theme.btn.hover} ${baseStyles}`;
}

/**
 * 根据主题配置获取对应的背景色和文字颜色类名
 * 用于页面容器的背景色设置
 */
export function getContainerStylesFromTheme(theme: ThemeConfig): string {
  // 从按钮样式中提取背景色和文字颜色
  // 按钮的 default 样式包含了 bg-xxx text-xxx
  const bgMatch = theme.btn.default.match(/bg-[\w-\[\]]+/);
  const textMatch = theme.btn.default.match(/text-[\w-\[\]]+/);

  // 如果没有匹配到，使用主题配置中的背景色和前景色
  if (!bgMatch || !textMatch) {
    // 对于使用 CSS 变量的情况，需要特殊处理
    if (theme.background.includes("var(")) {
      return "bg-[var(--background)] text-[var(--foreground)]";
    }
    // 回退到基础颜色
    return "bg-white text-black";
  }

  return `${bgMatch[0]} ${textMatch[0]}`;
}

/**
 * 根据 data-color 值获取对应的背景色和文字颜色类名
 * 用于页面容器的背景色设置（服务端渲染时使用，返回默认值）
 * @param color data-color 属性值
 * @param systemTheme 系统主题模式 ("light" | "dark" | "system")，用于自动调整配色
 */
export function getContainerStyles(
  color?: string | null,
  systemTheme: "light" | "dark" | "system" = "system"
): string {
  const theme = getTheme(color, systemTheme);
  return getContainerStylesFromTheme(theme);
}
