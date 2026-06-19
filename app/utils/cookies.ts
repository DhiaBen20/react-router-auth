import { createCookie } from "react-router";

export const authCookie = createCookie("auth-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
});

export const refreshCookie = createCookie("refresh-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
});

export const stateCookie = createCookie("openid-state", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
});
