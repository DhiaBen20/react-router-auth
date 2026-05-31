import { createCookie } from "react-router";

export const authCookie = createCookie("auth-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
});

export const refreshCookie = createCookie("refresh-token", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
});
