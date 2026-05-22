import { eq } from "drizzle-orm";
import { Secret, TOTP } from "otpauth";
import { db } from "~/db/client";
import {
    twoFactors,
    type NewTwoFactor,
    type TwoFactor,
    type User,
} from "~/db/schema";

export async function getUserTwoFactor(userId: User["id"]) {
    const tfaConfig = await db
        .select()
        .from(twoFactors)
        .where(eq(twoFactors.userId, userId));

    return tfaConfig.length ? tfaConfig[0] : null;
}

export function createTwoFactor(data: NewTwoFactor) {
    return db.insert(twoFactors).values(data);
}

export function updateTwoFactor(id: TwoFactor["id"], data: Partial<TwoFactor>) {
    return db.update(twoFactors).set(data).where(eq(twoFactors.id, id));
}

export function deleteTwoFactorForUser(userId: User["id"]) {
    return db.delete(twoFactors).where(eq(twoFactors.userId, userId));
}
