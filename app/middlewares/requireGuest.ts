import { redirect, type MiddlewareFunction } from "react-router";
import z from "zod";
import { verifyAccessToken } from "~/utils/auth-tokens";
import { authCookie } from "~/utils/cookies";
import { getCookie } from "~/utils/http";

export const requireGuest: MiddlewareFunction<Response> = async ({
    request,
}) => {
    const accessToken = await getCookie(request, authCookie, z.string());

    if (!accessToken) return;

    if (await verifyAccessToken(accessToken)) throw redirect("/");
};
