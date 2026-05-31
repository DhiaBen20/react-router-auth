import { compare, hash } from "bcrypt";
import type z from "zod";
import { type User } from "~/db/schema";
import {
    createRefreshToken,
    findValidRefreshToken,
    updateRefreshToken,
} from "~/models/refreshToken";
import { getUserTwoFactor } from "~/models/twoFactor";
import { createUser, findUser, findUserByEmail } from "~/models/user";
import { RegisterSchema } from "~/pages/register/components/RegisterForm";
import {
    calculateRefreshTokenExpiry,
    generateRefreshToken,
    signAccessToken,
    signTwoFactorChallengeToken,
} from "./auth-tokens";

type LoginCredentials = { email: string; password: string };

export async function authenticate(
    { email, password }: LoginCredentials,
    rememberMe = false,
) {
    const user = await findUserByEmail(email);
    const isPasswordValid = user && (await compare(password, user.password));
    if (!isPasswordValid) return null;

    const twoFactor = await getUserTwoFactor(user.id);
    if (twoFactor && twoFactor.confirmedAt) {
        const twoFactorToken = await signTwoFactorChallengeToken(
            user,
            rememberMe,
        );
        return { enabledTfa: true, user, twoFactorToken } as const;
    }

    const accessToken = await signAccessToken(user);
    const refreshToken = await createRefreshSession(user, rememberMe);

    return { enabledTfa: false, user, accessToken, refreshToken } as const;
}

export async function register(data: z.infer<typeof RegisterSchema>) {
    const passwordHash = await hash(data.password, 10);

    await createUser({
        email: data.email,
        name: data.name,
        password: passwordHash,
    });
}

export async function createRefreshSession(user: User, rememberMe = false) {
    const token = generateRefreshToken();

    await createRefreshToken({
        refreshToken: token,
        expiresAt: calculateRefreshTokenExpiry(rememberMe),
        userId: user.id,
        rememberMe: rememberMe,
    });

    return token;
}

export async function issueSessionTokens(user: User, rememberMe = false) {
    const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(user),
        createRefreshSession(user, rememberMe),
    ]);

    return { accessToken, refreshToken };
}

export async function refreshSession(oldRefreshToken: string) {
    // TODO: refactor to inner join
    const tokenMatch = await findValidRefreshToken(oldRefreshToken);
    const user = tokenMatch && (await findUser(tokenMatch.userId));
    if (!tokenMatch || !user) return null;

    await updateRefreshToken(tokenMatch.id, { usedAt: new Date() });

    const { accessToken, refreshToken } = await issueSessionTokens(
        user,
        tokenMatch.rememberMe,
    );

    return {
        accessToken,
        refreshToken,
        user,
        loginContext: {
            rememberMe: tokenMatch.rememberMe,
        },
    };
}
