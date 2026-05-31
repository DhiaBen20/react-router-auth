import { createContext } from "react-router";
import type z from "zod";
import type {
    AccessTokenPayload,
    ResetPasswordTokenPayload,
    TwoFactorChallengeTokenPayload,
} from "./auth-tokens";

export type AuthContext = z.infer<typeof AccessTokenPayload>;
export const authContext = createContext<AuthContext | null>(null);

export type ResetPasswordContext = z.infer<typeof ResetPasswordTokenPayload>;
export const resetPasswordContext = createContext<ResetPasswordContext | null>(
    null,
);

export type TwoFactorContext = z.infer<typeof TwoFactorChallengeTokenPayload>;
export const twoFactorContext = createContext<TwoFactorContext | null>(null);
