import { compare, hash } from "bcrypt";
import type z from "zod";
import { type User } from "~/db/schema";

import { db } from "~/db/client";
import { RegisterSchema } from "~/pages/register/components/RegisterForm";
import { OAuthAccountRepository } from "~/repositories/oauth-account";
import { RefreshTokenRepository } from "~/repositories/refresh-token";
import { UserRepository } from "~/repositories/user";
import {
    calculateRefreshTokenExpiry,
    generateRefreshToken,
    signAccessToken,
    signTwoFactorToken,
} from "./auth-tokens";
import type { IdTokenPayload } from "./google-oauth";

type LoginCredentials = { email: string; password: string };

export async function authenticate(
    { email, password }: LoginCredentials,
    rememberMe = false,
) {
    const userRepository = new UserRepository(db);
    const userTwoFactor =
        await userRepository.findUserWithTwoFactorByEmail(email);

    if (!userTwoFactor) return null;

    const { user, twoFactor } = userTwoFactor;

    const isPasswordValid =
        user.password && (await compare(password, user.password));
    if (!isPasswordValid) return null;

    if (twoFactor && twoFactor.confirmedAt) {
        const twoFactorToken = await signTwoFactorToken(user, rememberMe);
        return { enabledTfa: true, user, twoFactorToken } as const;
    }

    const accessToken = await signAccessToken(user);
    const refreshToken = await createRefreshSession(user, rememberMe);

    return { enabledTfa: false, user, accessToken, refreshToken } as const;
}

export async function register(data: z.infer<typeof RegisterSchema>) {
    const userRespository = new UserRepository(db);
    const passwordHash = await hash(data.password, 10);

    userRespository.create({
        email: data.email,
        name: data.name,
        password: passwordHash,
    });
}

export async function createRefreshSession(user: User, rememberMe = false) {
    const tokenRepository = new RefreshTokenRepository(db);
    const token = generateRefreshToken();
    await tokenRepository.create({
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
    const tokenRepository = new RefreshTokenRepository(db);
    const tokenWithUser = await tokenRepository.findWithUser(oldRefreshToken);

    if (
        !tokenWithUser ||
        tokenWithUser.refreshToken.usedAt ||
        tokenWithUser.refreshToken.expiresAt <= new Date()
    ) {
        return null;
    }

    const { user, refreshToken: tokenMatch } = tokenWithUser;

    await tokenRepository.update(tokenWithUser.refreshToken.id, {
        usedAt: new Date(),
    });

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

export async function findOrCreateGoogleUser(payload: IdTokenPayload) {
    const userRepository = new UserRepository(db);
    const oAuthAccountRepository = new OAuthAccountRepository(db);

    const googleAccount = await oAuthAccountRepository.findGoogleAcccount(
        payload.sub,
    );

    if (googleAccount) {
        const user = await userRepository.find(googleAccount.userId);
        if (!user) throw new Error("Google account exists but no user found");
        return user;
    }

    const user =
        (await userRepository.findByEmail(payload.email)) ??
        (await userRepository.create({
            name: payload.name,
            email: payload.email,
            emailVerifiedAt: payload.email_verified ? new Date() : null,
        }));

    await oAuthAccountRepository.create({
        provider: "google",
        providerUserId: payload.sub,
        userId: user.id,
    });

    return user;
}
