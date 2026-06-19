import { eq } from "drizzle-orm";
import {
    twoFactors,
    type NewTwoFactor,
    type TwoFactor,
    type User,
} from "~/db/schema";
import { BaseRepository } from "./base-repository";

export class TwoFactorRepository extends BaseRepository {
    async findForUser(userId: User["id"]) {
        const tfaConfig = await this.db
            .select()
            .from(twoFactors)
            .where(eq(twoFactors.userId, userId));

        return tfaConfig.length ? tfaConfig[0] : null;
    }

    async create(data: NewTwoFactor) {
        const result = await this.db
            .insert(twoFactors)
            .values(data)
            .returning();

        return result.length ? result[0] : null;
    }

    async update(id: TwoFactor["id"], data: Partial<TwoFactor>) {
        const result = await this.db
            .update(twoFactors)
            .set(data)
            .where(eq(twoFactors.id, id))
            .returning();

        return result.length ? result[0] : null;
    }

    deleteForUser(userId: User["id"]) {
        return this.db.delete(twoFactors).where(eq(twoFactors.userId, userId));
    }
}
