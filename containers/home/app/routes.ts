import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout(
    "components/shared/layout/app-layout.tsx",
    [
      index("routes/home.tsx"),
      route("downloader", "routes/downloader.tsx"),
      route("how-to", "routes/how-to.tsx")
    ]
  ),
] satisfies RouteConfig;
