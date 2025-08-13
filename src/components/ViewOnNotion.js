import { NotionIcon } from "./Icon";

export default function ViewOnNotion({ url }) {
  return (
    <button
      onClick={() => open(url)}
      className="my-8 rounded-xl bg-black text-white dark:bg-white dark:text-black cursor-pointer px-4 py-2.5 w-full sm:w-auto transition-all duration-300 hover:opacity-75"
    >
      <div className="flex flex-row space-x-2 items-center text-sm justify-center font-medium">
        <NotionIcon className="size-6" />
        <span>在 Notion 上查看</span>
      </div>
    </button>
  );
}
