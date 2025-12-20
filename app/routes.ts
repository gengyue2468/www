import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("blog", "routes/blog/blog.tsx", [
    index("routes/blog/blog._index.tsx"),
    route(":slug", "routes/blog/blog.$slug.tsx"),
  ]),
  route("chifan", "routes/chifan/chifan.tsx",[
    index("routes/chifan/chifan._index.tsx"),
  ]),
] satisfies RouteConfig;
