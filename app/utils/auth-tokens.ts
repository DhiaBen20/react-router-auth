import { randomBytes } from "node:crypto";
import z from "zod";
import type { User } from "~/db/schema";
import { signJwtToken, verifyJwtToken } from "./jwt";

export const AccessTokenPayload = z.object({
    iat: z.number().optional(),
    exp: z.number().optional(),
    type: z.literal("auth"),
    userId: z.number(),
    email: z.string(),
    emailVerified: z.boolean(),
});

export const ResetPasswordTokenPayload = z.object({
    iat: z.number().optional(),
    exp: z.number().optional(),
    type: z.literal("reset-password"),
    userId: z.number(),
});

export const TwoFactorChallengeTokenPayload = z.object({
    iat: z.number().optional(),
    exp: z.number().optional(),
    type: z.literal("two-factor"),
    userId: z.number(),
    rememberMe: z.boolean(),
});

export function signAccessToken(user: User) {
    return signJwtToken(
        {
            type: "auth",
            userId: user.id,
            email: user.email,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );
}

export function signResetPasswordToken(user: User) {
    return signJwtToken(
        {
            type: "reset-password",
            userId: user.id,
        },
        "10m",
    );
}

export function signTwoFactorChallengeToken(user: User, rememberMe = false) {
    return signJwtToken(
        {
            type: "two-factor",
            userId: user.id,
            rememberMe,
        },
        "5m",
    );
}

export async function verifyAccessToken(token: string) {
    try {
        const payload = await verifyJwtToken(token);

        return AccessTokenPayload.parse(payload);
    } catch {
        return null;
    }
}

export async function verifyResetPasswordToken(token: string) {
    try {
        const payload = await verifyJwtToken(token);

        return ResetPasswordTokenPayload.parse(payload);
    } catch {
        return null;
    }
}

export async function verifyTwoFactorChallengeToken(token: string) {
    try {
        const payload = await verifyJwtToken(token);

        return TwoFactorChallengeTokenPayload.parse(payload);
    } catch {
        return null;
    }
}

export function generateRefreshToken() {
    return randomBytes(64).toString("hex");
}

export function calculateRefreshTokenExpiry(rememberMe: boolean) {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return rememberMe ? nextWeek : nextHour;
}
