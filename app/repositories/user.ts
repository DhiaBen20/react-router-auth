import { eq } from "drizzle-orm";
import { twoFactors, users, type User } from "~/db/schema";
import { BaseRepository } from "./base-repository";

export class UserRepository extends BaseRepository {
    async find(userId: number) {
        const user = await this.db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return user.length ? user[0] : null;
    }

    async findByEmail(email: string) {
        const user = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user.length ? user[0] : null;
    }

    private userTwoFactorQuery() {
        return this.db
            .select()
            .from(users)
            .leftJoin(twoFactors, eq(twoFactors.userId, users.id));
    }

    async findUserWithTwoFactor(userId: number) {
        const result = await this.userTwoFactorQuery()
            .where(eq(users.id, userId))
            .limit(1);

        return result.length
            ? { user: result[0].users, twoFactor: result[0].two_factors }
            : null;
    }

    async findUserWithTwoFactorByEmail(email: string) {
        const result = await this.userTwoFactorQuery()
            .where(eq(users.email, email))
            .limit(1);

        return result.length
            ? { user: result[0].users, twoFactor: result[0].two_factors }
            : null;
    }

    async create(data: typeof users.$inferInsert) {
        const user = await this.db.insert(users).values(data).returning();

        return user[0];
    }

    async update(userId: number, updates: Partial<User>) {
        const result = await this.db
            .update(users)
            .set(updates)
            .where(eq(users.id, userId))
            .returning();

        return result[0];
    }
}
