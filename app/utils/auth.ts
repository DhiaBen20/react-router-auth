import { compare, hash } from "bcrypt";
import type { ActionFunctionArgs, CookieSerializeOptions } from "react-router";
import type z from "zod";
import { type User } from "~/db/schema";
import { createRefreshToken } from "~/models/refreshToken";
import { createUser, findUser, findUserByEmail } from "~/models/user";
import { RegisterSchema } from "~/pages/register/components/RegisterForm";
import { generateRefreshToken, signAuthToken } from "./auth-tokens";
import { authContext, type AuthContext } from "./contexts";
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

export function isAuthenticated(authContext: AuthContext | null) {
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

export function getRequiredAuth(
    context: ActionFunctionArgs["context"],
): AuthContext {
    const value = context.get(authContext);

    if (!value) {
        throw new Error(
            "Missing auth context. Make sure requireAuth middleware is used",
        );
    }

    return value;
}

export async function getRequiredUser(
    context: ActionFunctionArgs["context"],
): Promise<User> {
    const auth = getRequiredAuth(context);

    const user = await findUser(auth.userId);

    if (!user) {
        throw new Error("Auth user is not found");
    }

    return user;
}
