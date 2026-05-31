import { redirect, type MiddlewareFunction } from "react-router";
import z from "zod";
import { verifyResetPasswordToken } from "~/utils/auth-tokens";
import { resetPasswordContext } from "~/utils/contexts";
import { authCookie } from "~/utils/cookies";
import { getCookie } from "~/utils/http";

export const canResetPassword: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const token = await getCookie(request, authCookie, z.string());

    const payload = token ? await verifyResetPasswordToken(token) : null;

    if (!payload) throw redirect("/forgot-password");

    context.set(resetPasswordContext, payload);
};
