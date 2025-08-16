import { Command } from "cmdk";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { CommandIcon, MoonIcon, PCIcon, SunIcon } from "./Icon";
import { SearchIcon } from "lucide-react";
import { SegmentContainer, SegmentItem } from "./SegmentControl";
import { site } from "@/lib/site.config";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

// 统一样式常量 - 便于集中修改
const styles = {
  hoverBg: "bg-neutral-100 dark:bg-neutral-800",
  activeBg: "bg-neutral-200 dark:bg-neutral-700",
  selectedBg: "bg-neutral-100 dark:bg-neutral-900",
  currentThemeBg: "bg-neutral-100 dark:bg-neutral-800",
  kbdDefault:
    "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 mono",
  kbdHover: "bg-neutral-300 dark:bg-neutral-700",
  textHover: "text-neutral-900 dark:text-neutral-100",
  borderColor: "border-neutral-200 dark:border-neutral-800",
};

const Cmdk = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // 搜索输入处理
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // 导航函数
  const navigateToItem = (item) => {
    router.push(item.href);
    setOpen(false);
  };

  // 过滤导航项
  const filteredNavItems = useMemo(
    () =>
      site.NavItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  // 主题选项
  const themeOptions = [
    { value: "light", label: "明亮模式", icon: <SunIcon /> },
    { value: "dark", label: "黑暗模式", icon: <MoonIcon /> },
    { value: "system", label: "跟随系统", icon: <PCIcon /> },
  ];

  // 过滤主题选项
  const filteredThemes = useMemo(
    () =>
      themeOptions.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const hasResults = filteredNavItems.length > 0 || filteredThemes.length > 0;

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K 或 Cmd+K 切换面板
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePanel();
      }

      // Esc 键关闭面板
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }

      // 导航快捷键 (1-9)
      if (open && !e.metaKey && !e.ctrlKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (index < filteredNavItems.length) {
          e.preventDefault();
          navigateToItem(filteredNavItems[index]);
        }
      }

      // 主题切换快捷键 (Ctrl/Cmd + 1-3)
      if (open && (e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "3") {
        e.preventDefault();
        const themes = ["light", "dark", "system"];
        setTheme(themes[parseInt(e.key) - 1]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredNavItems, setTheme]);

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (e) => {
      const dialog = document.querySelector('[role="dialog"]');
      if (open && dialog && !dialog.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 切换面板状态
  const togglePanel = () => {
    setOpen((prev) => {
      const newOpen = !prev;
      if (newOpen) {
        setSearchQuery(""); // 重置搜索查询
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
      return newOpen;
    });
  };

  return (
    <div>
      {/* 触发按钮 */}
      <button
        onClick={togglePanel}
        className={`size-8 sm:size-10 rounded-md sm:rounded-lg ${styles.hoverBg} p-2 transition-all duration-200 hover:${styles.activeBg} active:scale-95 focus:outline-none text-neutral-700 dark:text-neutral-300`}
        aria-label="打开命令面板"
      >
        <CommandIcon className="size-auto" />
      </button>

      {/* 命令面板 */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="命令面板"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pt-20 transition-all duration-500",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-16 scale-90 opacity-0"
        )}
      >
        {/* 背景遮罩 */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
            open
              ? "opacity-100 ease-out"
              : "opacity-0 pointer-events-none ease-in"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* 面板内容 */}
        <div
          className={`relative w-full max-w-2xl rounded-3xl bg-white dark:bg-black border ${
            styles.borderColor
          } overflow-hidden shadow-xl transition-all duration-300 transform ${
            open
              ? "scale-100 opacity-100 translate-y-0 ease-out"
              : "scale-[0.98] opacity-0 translate-y-4 ease-in"
          }`}
        >
          <div className="relative">
            <SearchIcon className="absolute size-5 top-[17.5px] left-4 text-neutral-400 dark:text-neutral-500" />
            <Command.Input
              ref={inputRef}
              value={searchQuery}
              onValueChange={handleSearchChange}
              placeholder="输入命令或搜索..."
              className={`rounded-t-3xl rounded-b-none focus:outline-none w-full px-12 py-4 border-0 border-b ${styles.borderColor} bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 text-base transition-colors duration-200`}
            />
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto px-4 py-3 focus:outline-none transition-all duration-300">
            {filteredNavItems.length > 0 && (
              <Command.Group className="mb-2">
                <h1 className="text-xs sm:text-sm font-medium px-4 opacity-50 py-2 transition-all duration-300">
                  导航
                </h1>
                <SegmentContainer className="w-full">
                  {filteredNavItems.map((item, index) => (
                    <Command.Item
                      key={item.name}
                      value={item.name}
                      onSelect={() => navigateToItem(item)}
                      className="group"
                    >
                      <SegmentItem
                        onClick={() => navigateToItem(item)}
                        className={`flex justify-between w-full px-4 py-3 rounded-xl text-sm sm:text-base items-center gap-3 transition-all duration-300 cursor-pointer`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 p-0.5 opacity-50 transition-opacity duration-300 group-hover:opacity-75">
                            {item.icon}
                          </div>
                          <span
                            className={`font-medium transition-colors duration-300 group-hover:${styles.textHover}`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <kbd
                          className={`${styles.kbdDefault} rounded-md px-2 py-1 text-xs transition-all duration-300 group-hover:${styles.kbdHover}`}
                        >
                          {index + 1}
                        </kbd>
                      </SegmentItem>
                    </Command.Item>
                  ))}
                </SegmentContainer>
              </Command.Group>
            )}

            {filteredNavItems.length > 0 && filteredThemes.length > 0 && (
              <Command.Separator
                className={`my-2 ${styles.borderColor} h-[1px] transition-all duration-300`}
              />
            )}

            {filteredThemes.length > 0 && (
              <Command.Group>
                <h1 className="text-xs sm:text-sm font-medium px-4 opacity-50 py-2 transition-all duration-300">
                  主题
                </h1>
                <SegmentContainer className="w-full">
                  {filteredThemes.map((item, index) => (
                    <Command.Item
                      key={item.value}
                      value={item.label}
                      onSelect={() => setTheme(item.value)}
                      className="group"
                    >
                      <SegmentItem
                        onClick={() => setTheme(item.value)}
                        className="flex justify-between w-full px-4 py-3 rounded-xl text-sm sm:text-base items-center gap-3 transition-all duration-300 cursor-pointer
                        "
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 p-0.5 opacity-50 transition-opacity duration-300 group-hover:opacity-75">
                            {item.icon}
                          </div>
                          <span
                            className={`font-medium transition-colors duration-300 group-hover:${styles.textHover}`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <kbd
                          className={`${styles.kbdDefault} rounded-md px-2 py-1 text-xs transition-all duration-300 group-hover:${styles.kbdHover}`}
                        >
                          <span className="flex items-center gap-1">
                            <CommandIcon className="size-3" />+{index + 1}
                          </span>
                        </kbd>
                      </SegmentItem>
                    </Command.Item>
                  ))}
                </SegmentContainer>
              </Command.Group>
            )}

            {!hasResults && (
              <Command.Empty className="py-12 text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center transition-all duration-300">
                <div
                  className={`${styles.hoverBg} rounded-full p-3 mb-4 transition-colors duration-300`}
                >
                  <SearchIcon className="size-6 opacity-50" />
                </div>
                <span>没有找到结果</span>
                <span className="text-xs mt-2 opacity-70">尝试其他关键词</span>
              </Command.Empty>
            )}
          </Command.List>
        </div>
      </Command.Dialog>
    </div>
  );
};

export default Cmdk;
