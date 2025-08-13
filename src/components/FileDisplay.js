import {
  ExcelIcon,
  FolderIcon,
  PDFIcon,
  PowerPointIcon,
  WordIcon,
} from "./Icon";
import { SegmentItem } from "./SegmentControl";

export default function FileDisplay({ title, type, link }) {
  const IconStyle = "w-6";
  return (
    <SegmentItem sliderClassName="-translate-x-4 w-[calc(100%+3rem)]" className="mb-4 not-prose -translate-x-6 w-[calc(100%+3rem)]"> 
        <button className="flex flex-row space-x-2 justify-start items-center rounded-xl cursor-pointer px-6 py-2 w-full sm:w-auto transition-all duration-300 hover:opacity-75">
          <div className="w-6">
            {type === "word" && <WordIcon className={IconStyle} />}
            {type === "ppt" && <PowerPointIcon className={IconStyle} />}
            {type === "excel" && <ExcelIcon className={IconStyle} />}
            {type === "pdf" && <PDFIcon className={IconStyle} />}
            {type === "folder" && <FolderIcon className={IconStyle} />}
          </div>
          <div className="w-54 text-left">
            <h1 className="font-medium text-sm sm:text-base truncate">{title}</h1>
          </div>
        </button>
    </SegmentItem>
  );
}