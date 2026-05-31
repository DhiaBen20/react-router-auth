import { redirect, type MiddlewareFunction } from "react-router";
import { requireAuth } from "~/utils/auth-gurads";

export const verifiedEmail: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const { emailVerified } = requireAuth(context);

    if (!emailVerified) {
        const url = new URL(request.url);

        throw redirect(`/verify-email?returnTo=${url.pathname}`);
    }
};
