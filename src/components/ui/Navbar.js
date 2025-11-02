import {
  LogInIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  ShareIcon,
  SunIcon,
  TableOfContentsIcon,
} from "lucide-react";
import NavButton from "../ui/NavButton";
import { useTheme } from "next-themes";
import Tooltip from "./Tooltip";
import { useRouter } from "next/router";
import Popover from "./Popover";
import Share from "./Share";
import Login from "./Login";

export default function Navbar({
  title,
  sidebarOpen,
  openSidebar,
  forceSidebarOpen,
  tocOpen,
  openToc,
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const handleFocusFilter = () => {
    const filter = document.getElementById("filter");
    forceSidebarOpen();
    filter.focus();
  };
  return (
    <div className="fixed w-full top-0 bg-neutral-100 dark:bg-neutral-900 z-21">
      <div className="px-4 md:px-8 py-2 flex flex-row justify-between w-full items-center">
        <div className="flex flex-row gap-1 items-center">
          <Tooltip content={`${sidebarOpen ? "折叠" : "展开"}侧边栏`}>
            <NavButton onClick={() => openSidebar()}>
              {sidebarOpen ? (
                <PanelLeftCloseIcon className="size-4" />
              ) : (
                <PanelLeftOpenIcon className="size-4" />
              )}
            </NavButton>
          </Tooltip>
          <Tooltip content={router.asPath}>
            <h1
              onClick={() => router.push(router.asPath)}
              className="font-semibold mt-0.5 whitespace-nowrap truncate max-w-48 md:max-w-max px-2 py-1 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {title}
            </h1>
          </Tooltip>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Tooltip content="选中筛选瞄点">
            <NavButton onClick={handleFocusFilter}>
              <SearchIcon className="size-4" />
            </NavButton>
          </Tooltip>
          <Tooltip content="分享这个页面">
            <Popover content={<Share />}>
              <NavButton>
                <ShareIcon className="size-4" />
              </NavButton>
            </Popover>
          </Tooltip>
          <Tooltip content="登入">
            <Popover content={<Login />}>
              <NavButton>
                <LogInIcon className="size-4" />
              </NavButton>
            </Popover>
          </Tooltip>
          <Tooltip content="切换显示模式">
            <NavButton
              onClick={() =>
                setTheme(resolvedTheme == "light" ? "dark" : "light")
              }
            >
              {resolvedTheme == "light" ? (
                <MoonIcon className="size-4" />
              ) : (
                <SunIcon className="size-4" />
              )}
            </NavButton>
          </Tooltip>
          <Tooltip content={`${tocOpen ? "折叠" : "展开"}目录`}>
            <NavButton onClick={() => openToc()}>
              <TableOfContentsIcon className="size-4" />
            </NavButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
