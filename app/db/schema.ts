import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password_hash").notNull(),
    emailVerifiedAt: int("email_verified_at", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
