import { useState } from "react";
import { Link, useLocation } from "react-router";
import TocList from "../toc/toc-list";
import { useTableOfContents } from "../toc/toc";
import { useTocContext } from "@/contexts/toc-context";
import { Drawer } from "vaul";
import {
  HouseIcon,
  PersonIcon,
  ExportIcon,
  FileArrowUpIcon,
  ListIcon,
} from "@phosphor-icons/react";

interface MobileToolbarProps {
  onShare?: () => void;
}

export default function MobileToolbar({ onShare }: MobileToolbarProps) {
  const [open, setOpen] = useState(false);
  const { toc } = useTocContext();
  const { numberedToc, activeId, scrollToHeading } = useTableOfContents(toc);

  const handleTocItemClick = (id: string) => {
    scrollToHeading(id);
    setOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // 默认分享逻辑
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("分享取消或失败");
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("链接已复制到剪贴板！");
      } catch (err) {
        console.error("复制失败:", err);
      }
    }
  };

  const pathname = useLocation().pathname;

  return (
    <>
      {/* 底部工具栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-stone-50 safe-area-bottom">
        <div className="flex items-center justify-center py-4 px-2 gap-12">
          {/*首页*/}
          <Link to="/" className="no-underline!">
            <HouseIcon
              weight={pathname === "/" ? "fill" : "regular"}
              className="text-stone-900 transition-colors size-6"
            />
          </Link>
          {/* 关于我 */}
          <Link to="/about" className="no-underline!">
            <PersonIcon
              weight={pathname === "/about" ? "fill" : "regular"}
              className="text-stone-900 transition-colors size-6"
            />
          </Link>{" "}
          {/* 目录 */}
          {numberedToc && numberedToc.length > 0 && (
            <button onClick={() => setOpen(true)} className="no-underline!">
              <ListIcon
                weight="regular"
                className="text-stone-900 transition-colors size-6"
              />
            </button>
          )}
          {/* 分享 */}
          <button onClick={handleShare} className="no-underline!">
            <ExportIcon
              weight="regular"
              className="text-stone-900 transition-colors size-6"
            />
          </button>
          {/* 返回顶部 */}
          <button onClick={scrollToTop} className="no-underline!">
            <FileArrowUpIcon
              weight="regular"
              className="text-stone-900 transition-colors size-6"
            />
          </button>
        </div>
      </div>

      {/* TOC 抽屉 - 使用 Vaul */}
      <Drawer.Root open={open} onOpenChange={setOpen} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-stone-900/40 z-[60]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col bg-stone-50 rounded-t-[10px] h-[80vh] outline-none">
            {/* 拖动条 */}
            <div className="flex justify-center py-3 shrink-0">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
            </div>

            {/* 标题 */}
            <div className="h-0">
              <Drawer.Title />
              <Drawer.Description />
            </div>

            {/* TOC 列表 */}
            <div className="overflow-y-auto flex-1 px-4 py-4">
              {numberedToc && numberedToc.length > 0 && (
                <TocList
                  toc={numberedToc}
                  activeId={activeId}
                  onItemClick={handleTocItemClick}
                  compact={false}
                />
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
