import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password_hash").notNull(),
    emailVerifiedAt: int("email_verified_at", { mode: "timestamp" }),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
    id: int("id").primaryKey({ autoIncrement: true }),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: int("used_at", { mode: "timestamp" }),
    userId: int("user_id")
        .references(() => users.id)
        .notNull(),
});

export type User = typeof users.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
