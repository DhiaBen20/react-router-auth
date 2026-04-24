import { eq } from "drizzle-orm";
import { db } from "~/db/client";
import { users } from "~/db/schema";

export async function createUser(data: typeof users.$inferInsert) {
    const user = await db.insert(users).values(data).returning();

    return user[0];
}

export async function findUserByEmail(
    email: (typeof users.$inferInsert)["email"],
) {
    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return user.length ? user[0] : null;
}
