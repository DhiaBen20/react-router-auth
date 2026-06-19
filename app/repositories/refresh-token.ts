import { eq } from "drizzle-orm";
import {
    refreshTokens,
    users,
    type NewRefreshToken,
    type RefreshToken,
} from "~/db/schema";
import { BaseRepository } from "./base-repository";

export class RefreshTokenRepository extends BaseRepository {
    async find(token: string) {
        const result = await this.db
            .select()
            .from(refreshTokens)
            .where(eq(refreshTokens.refreshToken, token));

        return result.length ? result[0] : null;
    }

    async findWithUser(token: string) {
        const result = await this.db
            .select()
            .from(refreshTokens)
            .innerJoin(users, eq(users.id, refreshTokens.userId))
            .where(eq(refreshTokens.refreshToken, token));

        return result.length
            ? { refreshToken: result[0].refresh_tokens, user: result[0].users }
            : null;
    }

    async create(data: NewRefreshToken) {
        const result = await this.db
            .insert(refreshTokens)
            .values(data)
            .returning();

        return result[0];
    }

    update(id: RefreshToken["id"], updates: Partial<RefreshToken>) {
        return this.db
            .update(refreshTokens)
            .set(updates)
            .where(eq(refreshTokens.id, id));
    }
}
