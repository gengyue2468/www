import { Loader2Icon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-row space-x-1.5 items-center animate-pulse">
      <Loader2Icon size={16} className="animate-spin" /> <span className="opacity-75">Connecting Notion...</span>
    </div>
  );
}
