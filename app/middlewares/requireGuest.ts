import { redirect, type MiddlewareFunction } from "react-router";
import { isAuthenticated } from "~/utils/auth";
import { authContext } from "~/utils/contexts";

export const requireGuest: MiddlewareFunction<Response> = async ({
    context,
}) => {
    const value = context.get(authContext);

    if (isAuthenticated(value)) throw redirect("/");
};
