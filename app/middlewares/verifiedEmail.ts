import { redirect, type MiddlewareFunction } from "react-router";
import { authContext } from "~/utils/contexts";

export const verifiedEmail: MiddlewareFunction<Response> = async ({
    request,
    context,
}) => {
    const value = context.get(authContext);

    if (!value) {
        throw new Error(
            "authContext is null, add the requireAuth middleware to the route middleware export before this one",
        );
    }

    if (!value!.emailVerified) {
        const url = new URL(request.url);

        throw redirect(`/verify-email?returnTo=${url.pathname}`);
    }
};
