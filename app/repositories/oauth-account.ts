import { and, eq } from "drizzle-orm";
import { db } from "~/db/client";
import { oauthAccounts, type NewOAuthAccount } from "~/db/schema";
import { BaseRepository } from "./base-repository";

export class OAuthAccountRepository extends BaseRepository {
    async findGoogleAcccount(providerUserId: string) {
        const result = await db
            .select()
            .from(oauthAccounts)
            .where(
                and(
                    eq(oauthAccounts.provider, "google"),
                    eq(oauthAccounts.providerUserId, providerUserId),
                ),
            );

        return result.length ? result[0] : null;
    }

    async create(data: NewOAuthAccount) {
        const result = await db.insert(oauthAccounts).values(data).returning();

        return result[0];
    }
}
