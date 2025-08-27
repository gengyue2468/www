import { Command } from "cmdk";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { CommandIcon, MoonIcon, PCIcon, SunIcon } from "./Icon";
import { SearchIcon } from "lucide-react";
import { SegmentContainer, SegmentItem } from "./SegmentControl";
import { site } from "@/lib/site.config";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

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

const ANIMATION_CONFIG = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
  dialog: {
    initial: { opacity: 0, scale: 0.95, y: 200 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 200 },
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const Cmdk = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const navigateToItem = (item) => {
    router.push(item.href, { scroll: true });
    setOpen(false);
  };

  const filteredNavItems = useMemo(
    () =>
      site.NavItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const themeOptions = [
    { value: "light", label: "明亮模式", icon: <SunIcon /> },
    { value: "dark", label: "黑暗模式", icon: <MoonIcon /> },
    { value: "system", label: "跟随系统", icon: <PCIcon /> },
  ];

  const filteredThemes = useMemo(
    () =>
      themeOptions.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const hasResults = filteredNavItems.length > 0 || filteredThemes.length > 0;

  const togglePanel = () => {
    setOpen((prev) => {
      const newOpen = !prev;
      if (newOpen) {
        setSearchQuery(""); 
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
      return newOpen;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePanel();
        return;
      }

      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (!open) return;

      if (!e.metaKey && !e.ctrlKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (index < filteredNavItems.length) {
          e.preventDefault();
          navigateToItem(filteredNavItems[index]);
          return;
        }
      }

      if (!e.metaKey && !e.ctrlKey) {
        const keyNum = parseInt(e.key);
        if (!isNaN(keyNum)) {
          const themeStartNum = filteredNavItems.length + 1;
          const themeEndNum = filteredNavItems.length + 3;

          if (keyNum >= themeStartNum && keyNum <= themeEndNum) {
            e.preventDefault();
            const themes = ["light", "dark", "system"];
            const themeIndex = keyNum - themeStartNum;

            if (themeIndex < themes.length) {
              setTheme(themes[themeIndex]);
            }
            return;
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredNavItems, togglePanel, setOpen, navigateToItem, setTheme]);


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

  return (
    <div>
      <button
        onClick={togglePanel}
        className={`momo font-medium cursor-pointer flex flex-row space-x-1 px-4 py-2 items-center rounded-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 transition-all duration-200 active:scale-95 focus:outline-none`}
        aria-label="打开命令面板"
      >
        <CommandIcon className="size-3 sm:size-4" />{" "}
        <span className="text-sm sm:text-base font-mono">K</span>
      </button>

      <AnimatePresence>
        {open && (
          <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="命令面板"
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pt-20 transition-all duration-500 ",
              open
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-16 scale-90 opacity-0"
            )}
          >
            <motion.div
              className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              {...ANIMATION_CONFIG.overlay}
            />

            <motion.div
              className="relative w-full max-w-2xl z-50 bg-white dark:bg-black rounded-3xl border border-neutral-200 dark:border-neutral-800"
              {...ANIMATION_CONFIG.dialog}
            >
              <div className="relative">
                <SearchIcon className="absolute size-5 top-[17.5px] left-4 text-neutral-400 dark:text-neutral-500" />
                <Command.Input
                  ref={inputRef}
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                  placeholder="输入命令或搜索..."
                  className={`rounded-t-3xl bg-neutral-50 dark:bg-neutral-950 rounded-b-none focus:outline-none w-full px-12 py-4 border-0 border-b ${styles.borderColor} bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 text-base transition-colors duration-200`}
                />
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto px-4 py-3 focus:outline-none transition-all duration-300">
                {filteredNavItems.length > 0 && (
                  <Command.Group className="mb-2">
                    <h1 className="text-xs sm:text-sm font-medium px-4 opacity-50 py-2 transition-all duration-300">
                      导航
                    </h1>
                    <SegmentContainer className="-translate-x-2 w-[calc(100%+1rem)]">
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
                            <div className="flex items-center gap-4">
                              <div className="size-8 p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full opacity-50 transition-opacity duration-300 group-hover:opacity-75">
                                {item.icon}
                              </div>
                              <span
                                className={`font-medium transition-colors duration-300 group-hover:${styles.textHover}`}
                              >
                                {item.name}<sub className="ml-2.5 text-xs font-semibold opacity-50">{item.href}</sub>
                              </span>
                            </div>
                            <kbd
                              className={`${styles.kbdDefault} opacity-50 rounded-full size-8 flex justify-center items-center text-xs transition-all duration-300 group-hover:${styles.kbdHover}`}
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
                  <hr className="w-[calc(100%+2rem)] text-neutral-200 dark:text-neutral-800 -translate-x-4 my-4" />
                )}

                {filteredThemes.length > 0 && (
                  <Command.Group>
                    <h1 className="text-xs sm:text-sm font-medium px-4 opacity-50 py-2 transition-all duration-300">
                      主题
                    </h1>
                    <SegmentContainer className="-translate-x-2 w-[calc(100%+1rem)]">
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
                            <div className="flex items-center gap-4">
                              <div className="size-8 p-2 bg-neutral-200 dark:bg-neutral-800 rounded-full opacity-50 transition-opacity duration-300 group-hover:opacity-75">
                                {item.icon}
                              </div>
                              <span
                                className={`font-medium transition-colors duration-300 group-hover:${styles.textHover}`}
                              >
                                {item.label}
                              </span>
                            </div>
                            <kbd
                              className={`${styles.kbdDefault} opacity-50 rounded-full size-8 flex justify-center items-center text-xs transition-all duration-300 group-hover:${styles.kbdHover}`}
                            >
                              <span className="flex items-center gap-1">
                                {filteredNavItems.length + 1 + index}
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
                    <span className="text-xs mt-2 opacity-70">
                      尝试其他关键词
                    </span>
                  </Command.Empty>
                )}
              </Command.List>
            </motion.div>
          </Command.Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cmdk;
