import { drizzle } from "drizzle-orm/libsql/node";

export const db = drizzle({
    connection: {
        url: process.env.DB_URL!,
    },
});
