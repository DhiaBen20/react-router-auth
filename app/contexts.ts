import { createContext } from "react-router";
import type { AuthTokenPayload } from "./utils/auth-tokens";

export const claimsContext = createContext<AuthTokenPayload | null>(null);
