import { hash, randomBytes } from "node:crypto";
import { Secret, TOTP } from "otpauth";
import type { TwoFactor } from "~/db/schema";

export async function generateRecoveryCodes() {
    return Promise.all(
        Array.from({ length: 8 }, () => randomBytes(5).toString("hex")),
    );
}

export function hashRecoveryCode(code: string) {
    return hash("sha256", code, "hex");
}

export function hashRecoveryCodes(codes: string[]) {
    return codes.map(hashRecoveryCode);
}

export function verifyTotp(secretKey: TwoFactor["secretKey"], code: string) {
    const secret = Secret.fromBase32(secretKey);
    const totp = new TOTP({ secret, digits: 6, algorithm: "sha1" });

    return totp.validate({ token: code }) !== null;
}
