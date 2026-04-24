import { redirect, type MiddlewareFunction } from "react-router";
import { claimsContext } from "~/contexts";
import { isAuthenticated } from "~/utils/auth";

export const requireGuest: MiddlewareFunction = async ({ context }) => {
    const claims = context.get(claimsContext);

    if (isAuthenticated(claims)) throw redirect("/");
};
