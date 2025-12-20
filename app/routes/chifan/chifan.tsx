import { Outlet } from "react-router";
import type { Route } from "./+types/chifan";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HUST 吃饭" },
    {
      name: "description",
      content:
        "嘻嘻，你想不想知道现在还有什么吃的？",
    },
  ];
}

export default function ChifanLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
