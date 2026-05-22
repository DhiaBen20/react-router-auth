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
    layout("./components/layouts/settings-layout.tsx", [
        route("/settings/profile", "routes/settings/profile.tsx"),
        route("/settings/security", "routes/settings/security.tsx", [
            route("update-password", "routes/settings/update-password.tsx"),
            route("enable-two-factor", "routes/settings/enable-two-factor.tsx"),
            route(
                "confirm-two-factor",
                "routes/settings/confirm-two-factor.tsx",
            ),
            route(
                "disable-two-factor",
                "routes/settings/disable-two-factor.tsx",
            ),
            route(
                "generate-recovery-codes",
                "routes/settings/generate-recovery-codes.tsx",
            ),
        ]),
    ]),
] satisfies RouteConfig;
