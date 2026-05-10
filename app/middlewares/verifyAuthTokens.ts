import { type MiddlewareFunction } from "react-router";
import {
    findValidRefreshToken,
    updateRefreshToken,
} from "~/models/refreshToken";
import { findUser } from "~/models/user";
import { login } from "~/utils/auth";
import { getCurrentAuthTokens, verifyAuthToken } from "~/utils/auth-tokens";
import { authContext } from "~/utils/contexts";

export const verifyAuthTokens: MiddlewareFunction<Response> = async (
    { request, context },
    next,
) => {
    const { authToken, refreshToken } = await getCurrentAuthTokens(request);

    if (authToken) {
        try {
            const claims = await verifyAuthToken(authToken);

            if (claims) {
                context.set(authContext, {
                    type: claims.type,
                    userId: claims.userId,
                    emailVerified: Boolean(claims.emailVerified),
                });
            }

            return;
        } catch (e) {}
    }

    if (!refreshToken) return;

    const tokenMatch = await findValidRefreshToken(refreshToken);
    if (!tokenMatch) return;
    const user = await findUser(tokenMatch.userId)!;
    if (!user) return;

    context.set(authContext, {
        type: "auth",
        userId: user.id,
        emailVerified: Boolean(user.emailVerifiedAt),
    });

    const response = await next();
    await Promise.all([
        updateRefreshToken(tokenMatch.id, { usedAt: new Date() }),
        login(user, response.headers),
    ]);
    return response;
};
