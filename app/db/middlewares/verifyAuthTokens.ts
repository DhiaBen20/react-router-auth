import { JWTExpired } from "jose/errors";
import { type MiddlewareFunction } from "react-router";
import { claimsContext } from "~/contexts";
import { authCookie } from "~/utils/auth";
import { verifyAuthToken } from "~/utils/auth-tokens";

export const verifyAuthTokens: MiddlewareFunction = async ({
    request,
    context,
}) => {
    const cookie = request.headers.get("Cookie");
    const token = (await authCookie.parse(cookie)) as string | null;

    if (!token) return;

    try {
        const claims = await verifyAuthToken(token);

        context.set(claimsContext, claims);
    } catch (e) {
        if (e instanceof JWTExpired) return;
        console.log(e);
    }
};
