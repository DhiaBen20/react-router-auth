import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password_hash"),
    emailVerifiedAt: int("email_verified_at", { mode: "timestamp" }),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
    id: int("id").primaryKey({ autoIncrement: true }),
    refreshToken: text("refresh_token").notNull().unique(),
    expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: int("used_at", { mode: "timestamp" }),
    rememberMe: int("remember_me", { mode: "boolean" }).notNull(),
    userId: int("user_id")
        .references(() => users.id)
        .notNull(),
});

export const otps = sqliteTable("otps", {
    id: int("id").primaryKey({ autoIncrement: true }),
    otpHash: text("otp_hash").notNull(),
    userId: int("user_id")
        .references(() => users.id)
        .notNull(),
    expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: int("used_at", { mode: "timestamp" }),
});

export const twoFactors = sqliteTable("two_factors", {
    id: int("id").primaryKey({ autoIncrement: true }),
    secretKey: text("secret_key").notNull(),
    recoveryCodes: text("recovery_codes", { mode: "json" }),
    confirmedAt: int("confirmat_at", { mode: "timestamp" }),
    userId: int("user_id")
        .references(() => users.id)
        .notNull()
        .unique(),
});

export const oauthAccounts = sqliteTable(
    "oauth_accounts",
    {
        id: int("id").primaryKey({ autoIncrement: true }),
        provider: text("provider").notNull(),
        providerUserId: text("provider_user_id").notNull(),
        userId: int("user_id")
            .references(() => users.id)
            .notNull(),
    },
    (table) => [
        uniqueIndex("provider_sub_idx").on(
            table.provider,
            table.providerUserId,
        ),
    ],
);

export type User = typeof users.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
export type TwoFactor = typeof twoFactors.$inferSelect;
export type NewTwoFactor = typeof twoFactors.$inferInsert;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert;
