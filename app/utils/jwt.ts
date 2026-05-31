import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export function jwtKey() {
    return new TextEncoder().encode(process.env.JWT_KEY!);
}

export function signJwtToken(
    payload: JWTPayload,
    expiry: string | Date | number,
) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(jwtKey());
}

export async function verifyJwtToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, jwtKey());

        return payload;
    } catch {
        return null;
    }
}
