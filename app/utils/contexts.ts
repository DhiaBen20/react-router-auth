import { createContext } from "react-router";
import type z from "zod";
import type { AuthTokenPayloadSchema } from "./auth-tokens";

export type AuthContext = {
    type: z.infer<typeof AuthTokenPayloadSchema>["type"];
    userId: number;
    emailVerified: boolean;
} | null;

export const authContext = createContext<AuthContext>(null);
