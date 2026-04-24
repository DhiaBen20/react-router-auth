import { compare, hash } from "bcrypt";
import { createCookie } from "react-router";
import type z from "zod";
import type { User } from "~/db/schema";
import { createUser, findUserByEmail } from "~/models/user";
import { RegisterSchema } from "~/pages/register/schemas";
import { signAuthToken, type AuthTokenPayload } from "./auth-tokens";

export const authCookie = createCookie("auth-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
});

export async function checkAuthCredentials({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    const user = await findUserByEmail(email);

    return user && (await compare(password, user.password)) ? user : null;
}

export function isAuthenticated(claims: AuthTokenPayload | null) {
    return claims && claims.type === "auth";
}

export async function login(user: User) {
    const jwt = await signAuthToken(
        {
            type: "auth",
            userId: user.id,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );

    const headers = new Headers();

    headers.append(
        "Set-Cookie",
        await authCookie.serialize(jwt, { maxAge: 15 * 1000 }),
    );

    return headers;
}

export async function register(data: z.infer<typeof RegisterSchema>) {
    const passwordHash = await hash(data.password, 10);

    await createUser({
        email: data.email,
        name: data.name,
        password: passwordHash,
    });
}
