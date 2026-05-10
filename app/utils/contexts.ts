import { createContext } from "react-router";
import type z from "zod";
import { AuthTokenPayloadSchema } from "./auth-tokens";

export type AuthContext = z.infer<typeof AuthTokenPayloadSchema> | null;

export const authContext = createContext<AuthContext>(null);
