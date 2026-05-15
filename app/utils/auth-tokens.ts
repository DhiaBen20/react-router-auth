import type { JWTPayload } from "jose";
import { jwtVerify, SignJWT } from "jose";
import { randomBytes } from "node:crypto";
import z from "zod";
import { authCookie, refreshCookie } from "./cookies";

export const AuthTokenPayloadSchema = z.object({
    type: z.union([z.literal("auth"), z.literal("reset-password")]),
    userId: z.number(),
    emailVerified: z.boolean(),
});

export function jwtKey() {
    return new TextEncoder().encode(process.env.JWT_KEY!);
}

export function signAuthToken(
    payload: JWTPayload & z.infer<typeof AuthTokenPayloadSchema>,
    expiry: string | Date | number,
) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(jwtKey());
}

export async function verifyAuthToken(token: string) {
    const verifyResult = await jwtVerify(token, jwtKey());
    const parseResult = AuthTokenPayloadSchema.safeParse(verifyResult.payload);

    if (parseResult.success)
        return { ...verifyResult.payload, ...parseResult.data };

    return null;
}

export function generateRefreshToken() {
    return randomBytes(64).toString("hex");
}

export async function getCurrentAuthTokens(request: Request) {
    const cookie = request.headers.get("Cookie");

    const [authToken, refreshToken] = await Promise.all([
        authCookie.parse(cookie),
        refreshCookie.parse(cookie),
    ]);

    return {
        authToken: typeof authToken === "string" ? authToken : null,
        refreshToken: typeof refreshToken === "string" ? refreshToken : null,
    };
}

export async function destroyAuthCookies(headers = new Headers()) {
    headers.append(
        "Set-Cookie",
        await authCookie.serialize("", { maxAge: -1 }),
    );

    headers.append(
        "Set-Cookie",
        await refreshCookie.serialize("", { maxAge: -1 }),
    );
}
