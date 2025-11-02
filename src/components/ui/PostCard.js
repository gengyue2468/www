import { FileTextIcon } from "lucide-react";
import { useRouter } from "next/router";
import classNames from "classnames";

export default function PostCard({ title, date, slug, type, ...props }) {
  const router = useRouter();

  const targetUrl = type == "blog" ? `/blog/${slug}` : `/${slug}`;
  const active = router.asPath == targetUrl;
  return (
    <div
      onClick={() => router.push(targetUrl)}
      className={classNames(
        "rounded-lg hover:bg-gradient-to-b hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white cursor-pointer pr-4 pl-9 py-2 flex flex-row gap-2 items-center",
        active &&
          "bg-neutral-200 dark:bg-neutral-800"
      )}
      {...props}
    >
      <FileTextIcon className="size-5 min-w-5" />
      <span className="font-medium whitespace-nowrap truncate">{title}</span>
    </div>
  );
}
