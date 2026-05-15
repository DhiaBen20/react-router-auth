import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "~/db/client";
import { otps, type NewOtp, type Otp, type User } from "~/db/schema";

export function createOtp(data: NewOtp) {
    return db.insert(otps).values(data);
}

export async function findValidOtpByUserId(
    userId: User["id"],
    otpHash: string,
) {
    const match = await db
        .select()
        .from(otps)
        .where(
            and(
                eq(otps.otpHash, otpHash),
                eq(otps.userId, userId),
                isNull(otps.usedAt),
                gt(otps.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return match.length ? match[0] : null;
}

export function revokeOtp(otpId: Otp["id"]) {
    return db
        .update(otps)
        .set({ usedAt: new Date() })
        .where(eq(otps.id, otpId));
}
