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

export async function updateUser(userId: User["id"], updates: Partial<User>) {
    const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

    return result[0];
}

export function updateUserPassword(userId: User["id"], passwordHash: string) {
    return updateUser(userId, { password: passwordHash });
}
