import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "./ui/progressive-blur";
import { motion } from "motion/react";

export default function Bar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const Nav = [
    {
      name: "关于",
      href: "/",
      icon: <HomeIcon />,
    },
    {
      name: "随想",
      href: "/thoughts",
      icon: <ThoughtIcon />,
    },
    {
      name: "AI Chatbot",
      href: "/chat",
      icon: <ChatIcon />,
    },
  ];

  const Button = ({ active, children, ...props }) => {
    return (
      <motion.button
        
        className={cn(
          "cursor-pointer flex flex-col items-center justify-center size-12 rounded-full transition-all duration-300 ",
          active
            ? "bg-neutral-200/50 dark:bg-neutral-800/50 backdrop-blur-3xl text-primary"
            : "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div>
      <ProgressiveBlur
        direction="top"
        className="pointer-events-none fixed top-0 left-0 h-48 w-full z-10"
        blurIntensity={0.75}
        blurLayers={2}
      />
      <div className="shadow-sm z-20 transition-all duration-300 fixed bottom-8 left-1/2 -translate-x-1/2 border border-neutral-300/25 dark:border-neutral-700/25 bg-opacity-50 backdrop-blur-lg p-1.5 rounded-full max-w-full">
        <div className="flex flex-row items-center justify-center space-x-0.5">
          {Nav.map((item, index) => (
            <Button
              onClick={() => router.push(item.href)}
              active={
                item.href === "/"
                  ? router.asPath === "/"
                  : router.asPath.includes(item.href)
              }
              key={index}
              alt={item.name}
            >
              <span>{item.icon}</span>
            </Button>
          ))}
          <Button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            alt="切换主题"
          >
            <span>
              {resolvedTheme === "system" && <SystemIcon />}
              {resolvedTheme === "light" && <SunIcon />}
              {resolvedTheme === "dark" && <MoonIcon />}
            </span>
            <span></span>
          </Button>
        </div>
      </div>
      <ProgressiveBlur
        className="pointer-events-none fixed bottom-0 left-0 h-64 w-full z-10"
        blurIntensity={1}
        direction="bottom"
        blurLayers={2}
      />
    </div>
  );
}

const HomeIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
const ThoughtIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
    </svg>
  );
};
const ChatIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const SystemIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const SunIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
    </svg>
  );
};

const MoonIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
