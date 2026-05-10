import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "~/db/client";
import {
    refreshTokens,
    type NewRefreshToken,
    type RefreshToken,
} from "~/db/schema";

export async function findValidRefreshToken(token: string) {
    const result = await db
        .select()
        .from(refreshTokens)
        .where(
            and(
                eq(refreshTokens.refreshToken, token),
                isNull(refreshTokens.usedAt),
                gt(refreshTokens.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return result.length ? result[0] : null;
}

export function createRefreshToken(data: NewRefreshToken) {
    return db.insert(refreshTokens).values(data);
}

export function updateRefreshToken(
    id: RefreshToken["id"],
    updates: Partial<RefreshToken>,
) {
    return db
        .update(refreshTokens)
        .set(updates)
        .where(eq(refreshTokens.id, id));
}
