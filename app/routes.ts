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
        route("/forgot-password", "routes/auth/forgot-password.tsx", [
            route("send-code", "routes/auth/send-reset-code.tsx"),
            route("verify-code", "routes/auth/verify-reset-code.tsx"),
        ]),
        route("/reset-password", "routes/auth/reset-password.tsx"),
        route("/verify-email", "routes/auth/verify-email.tsx", [
            route("send-code", "routes/auth/send-verification-code.tsx"),
            route("verify-code", "routes/auth/confirm-verification-code.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
