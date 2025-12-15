import type { Route } from "./+types/blog";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Geng Yue 的博客" },
    {
      name: "description",
      content:
        "Geng Yue 的个人博客，记录前端开发、计算机科学和杂七杂八的想法。",
    },
  ];
}

export default function BlogLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
