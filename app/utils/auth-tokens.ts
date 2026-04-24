import type { JWTPayload } from "jose";
import { jwtVerify, SignJWT } from "jose";
import z from "zod";

const AuthTokenPayloadSchema = z.object({
    type: z.literal("auth"),
    userId: z.number(),
    emailVerified: z.boolean().optional(),
});

export type AuthTokenPayload = JWTPayload &
    z.infer<typeof AuthTokenPayloadSchema>;

export function jwtKey() {
    return new TextEncoder().encode(process.env.JWT_KEY!);
}

export function signAuthToken(
    payload: AuthTokenPayload,
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

    if (parseResult.success) return {...verifyResult.payload,...parseResult.data};

    return null;
}
