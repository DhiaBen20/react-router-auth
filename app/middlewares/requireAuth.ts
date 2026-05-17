import { redirect, type MiddlewareFunction } from "react-router";
import { isAuthenticated } from "~/utils/auth";
import { authContext } from "~/utils/contexts";

export const requireAuth: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const value = context.get(authContext);

    if (!isAuthenticated(value)) {
        const url = new URL(request.url);

        throw redirect(`/login?returnTo=${url.pathname}`);
    }
};
