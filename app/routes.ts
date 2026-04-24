import {
    type RouteConfig,
    index,
    layout,
    route,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("./components/layouts/auth-layout.tsx", [
        route("/login", "routes/auth/login.tsx"),
        route("/register", "routes/auth/register.tsx"),
    ]),
] satisfies RouteConfig;
