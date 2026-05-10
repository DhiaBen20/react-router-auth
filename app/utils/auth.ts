import { compare, hash } from "bcrypt";
import type z from "zod";
import { type User } from "~/db/schema";
import { createRefreshToken } from "~/models/refreshToken";
import { createUser, findUserByEmail } from "~/models/user";
import { RegisterSchema } from "~/pages/register/schemas";
import { generateRefreshToken, signAuthToken } from "./auth-tokens";
import type { AuthContext } from "./contexts";
import { authCookie, refreshCookie } from "./cookies";

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

export function isAuthenticated(authContext: AuthContext) {
    return authContext && authContext.type === "auth";
}

export async function login(user: User, headers: Headers = new Headers()) {
    const jwt = await signAuthToken(
        {
            type: "auth",
            userId: user.id,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );

    const refreshToken = generateRefreshToken();

    await createRefreshToken({
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: user.id,
    });

    headers.append("Set-Cookie", await authCookie.serialize(jwt));
    headers.append("Set-Cookie", await refreshCookie.serialize(refreshToken));

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
