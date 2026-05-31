import { redirect, type MiddlewareFunction } from "react-router";
import z from "zod";
import { verifyTwoFactorChallengeToken } from "~/utils/auth-tokens";
import { twoFactorContext } from "~/utils/contexts";
import { authCookie } from "~/utils/cookies";
import { getCookie } from "~/utils/http";

export const twoFactorPending: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const token = await getCookie(request, authCookie, z.string());

    const payload = token ? await verifyTwoFactorChallengeToken(token) : null;

    if (!payload) throw redirect("/login");

    context.set(twoFactorContext, payload);
};
