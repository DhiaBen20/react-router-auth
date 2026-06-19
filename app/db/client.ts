import { drizzle } from "drizzle-orm/libsql/node";

export const db = drizzle({
    connection: {
        url: process.env.DB_URL!,
    },
});

export type DB = typeof db;
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
