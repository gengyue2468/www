import {
  ExcelIcon,
  FolderIcon,
  PDFIcon,
  PowerPointIcon,
  WordIcon,
} from "./Icon";
import NextLink from "./NextLink";

export default function FileDisplay({ title, type, link }) {
  const IconStyle = "w-6";
  return (
    <div className="mb-2"> 
      <NextLink href={link}>
        <div className="flex flex-row space-x-2 items-center py-1">
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
      </NextLink>
    </div>
  );
}
