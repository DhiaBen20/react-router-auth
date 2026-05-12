import z from "zod";

export const LoginSchema = z.object({
    email: z.email().min(1, "Email is required"),
    password: z
        .string("Password is required")
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long"),
    rememberMe: z.transform((v) => (typeof v === "boolean" ? v : v === "true")),
});
