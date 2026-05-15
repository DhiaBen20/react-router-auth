import z from "zod";

export const VerifyResetCodeSchema = z.object({
    email: z.email().min(1, "Email is required"),
    code: z.string().min(1, "Verification code is required"),
});
