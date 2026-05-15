import z from "zod";

const ResetPasswordSchema = z
    .object({
        password: z
            .string("Password is Required")
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long"),
        passwordConfirmation: z.string("Password confirmation is required"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        error: "Passwords don't match",
        path: ["passwordConfirmation"],
    });

export default ResetPasswordSchema;
