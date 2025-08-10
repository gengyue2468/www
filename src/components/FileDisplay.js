import {
  ExcelIcon,
  FolderIcon,
  PDFIcon,
  PowerPointIcon,
  WordIcon,
} from "./Icon";

export default function FileDisplay({ title, type, link }) {
  const IconStyle = "w-10";
  return (
    <div
      onClick={() => open(link)}
      className="mb-4 cursor-pointer not-prose bg-neutral-100 dark:bg-neutral-900 rounded-3xl px-4 py-6 -translate-x-4 border border-neutral-200 dark:border-neutral-800 w-80"
    >
      <div className="flex flex-row space-x-4 items-center">
        <div className="">
          {type === "word" && <WordIcon className={IconStyle} />}
          {type === "ppt" && <PowerPointIcon className={IconStyle} />}
          {type === "excel" && <ExcelIcon className={IconStyle} />}
          {type === "pdf" && <PDFIcon className={IconStyle} />}
          {type === "folder" && <FolderIcon className={IconStyle} />}
        </div>
        <div className="">
          <h1 className="font-medium text-sm sm:text-base">{title}</h1>
        </div>
      </div>
    </div>
  );
}
