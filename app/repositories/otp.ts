import { and, eq, gt, isNull } from "drizzle-orm";
import { otps, type NewOtp, type Otp, type User } from "~/db/schema";
import { BaseRepository } from "./base-repository";

export class OtpRepository extends BaseRepository {
    async findValidOtp(userId: User["id"], otpHash: string) {
        const match = await this.db
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

    async create(data: NewOtp) {
        const result = await this.db.insert(otps).values(data).returning();

        return result[0];
    }

    async update(otpId: Otp["id"], updates: Partial<Otp>) {
        const res = await this.db
            .update(otps)
            .set(updates)
            .where(eq(otps.id, otpId))
            .returning();

        return res[0];
    }

    async updateForUser(user: User["id"], updates: Partial<Otp>) {
        return this.db
            .update(otps)
            .set(updates)
            .where(eq(otps.userId, user))
            .returning();
    }
}
