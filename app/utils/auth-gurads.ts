import {
    redirect,
    type RouterContext,
    type RouterContextProvider,
} from "react-router";
import { findUser } from "~/models/user";
import {
    authContext,
    resetPasswordContext,
    twoFactorContext,
} from "./contexts";

function requireContext<T>(
    provider: Readonly<RouterContextProvider>,
    context: RouterContext<T>,
    redirectTo: string,
): NonNullable<T> {
    const value = provider.get(context);

    if (!value) throw redirect(redirectTo);

    return value;
}

async function requireUser(userId: number) {
    const user = await findUser(userId);

    if (!user) throw redirect("/login");

    return user;
}

export function requireAuth(provider: Readonly<RouterContextProvider>) {
    return requireContext(provider, authContext, "/login");
}

export async function requireAuthUser(
    provider: Readonly<RouterContextProvider>,
) {
    const { userId } = requireAuth(provider);

    return await requireUser(userId);
}

export function requireTwoFactor(provider: Readonly<RouterContextProvider>) {
    return requireContext(provider, twoFactorContext, "/login");
}

export async function requireTwoFactorUser(
    provider: Readonly<RouterContextProvider>,
) {
    const { userId } = requireTwoFactor(provider);

    return await requireUser(userId);
}

export function requireResetPassword(
    provider: Readonly<RouterContextProvider>,
) {
    return requireContext(provider, resetPasswordContext, "/forgot-password");
}
