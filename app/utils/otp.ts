import { createHash, randomInt } from "node:crypto";

const OTP_EXPIRY_MS = 5 * 60 * 100;

export function generateOtp() {
    return randomInt(100_000, 1_000_000).toString();
}
export function hashOtp(code: string) {
    return createHash("sha256").update(code).digest("hex");
}

export function calculateOtpExpiryDate() {
    return new Date(Date.now() + OTP_EXPIRY_MS);
}
