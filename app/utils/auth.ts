import { compare, hash } from "bcrypt";
import type { CookieSerializeOptions } from "react-router";
import type z from "zod";
import { type User } from "~/db/schema";
import { createRefreshToken } from "~/models/refreshToken";
import { createUser, findUserByEmail } from "~/models/user";
import { RegisterSchema } from "~/pages/register/components/RegisterForm";
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

export async function login(
    user: User,
    remember: boolean = true,
    headers: Headers = new Headers(),
) {
    const jwt = await signAuthToken(
        {
            type: "auth",
            userId: user.id,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );

    const refreshToken = generateRefreshToken();

    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await createRefreshToken({
        refreshToken: refreshToken,
        expiresAt: remember ? nextWeek : nextHour,
        userId: user.id,
        rememberMe: remember,
    });

    const cookieExpire: CookieSerializeOptions | undefined = remember
        ? undefined
        : { maxAge: undefined };

    await Promise.all([
        authCookie.serialize(jwt, cookieExpire),
        refreshCookie.serialize(refreshToken, cookieExpire),
    ]).then((c) => {
        headers.append("Set-Cookie", c[0]);
        headers.append("Set-Cookie", c[1]);
    });

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
