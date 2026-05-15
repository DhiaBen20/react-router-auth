import { eq } from "drizzle-orm";
import { db } from "~/db/client";
import { users, type User } from "~/db/schema";

export async function createUser(data: typeof users.$inferInsert) {
    const user = await db.insert(users).values(data).returning();

    return user[0];
}

export async function findUserByEmail(email: User["email"]) {
    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return user.length ? user[0] : null;
}

export async function findUser(id: User["id"]) {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return user.length ? user[0] : null;
}

export function updateUserPassword(userId: User["id"], passwordHash: string) {
    return db
        .update(users)
        .set({
            password: passwordHash,
        })
        .where(eq(users.id, userId));
}
