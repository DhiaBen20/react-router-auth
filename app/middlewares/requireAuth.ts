import { redirect, type MiddlewareFunction } from "react-router";
import z from "zod";
import { refreshSession } from "~/utils/auth";
import { verifyAccessToken } from "~/utils/auth-tokens";
import { authContext } from "~/utils/contexts";
import { authCookie, refreshCookie } from "~/utils/cookies";
import { getCookie, setSessionCookies } from "~/utils/http";

export const requireAuth: MiddlewareFunction<Response> = async (
    { request, context },
    next,
) => {
    const accessToken = await getCookie(request, authCookie, z.string());
    const payload = accessToken ? await verifyAccessToken(accessToken) : null;

    if (payload) {
        context.set(authContext, payload);

        return;
    }

    const url = new URL(request.url);

    const refreshToken = await getCookie(request, refreshCookie, z.string());

    if (!refreshToken) throw redirect(`/login?returnTo=${url.pathname}`);

    const result = await refreshSession(refreshToken);

    if (!result) throw redirect(`/login?returnTo=${url.pathname}`);

    context.set(authContext, {
        type: "auth",
        email: result.user.email,
        emailVerified: Boolean(result.user.emailVerifiedAt),
        userId: result.user.id,
    });

    const response = await next();
    await setSessionCookies(
        {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
        result.loginContext.rememberMe,
        response.headers,
    );
    return response;
};
