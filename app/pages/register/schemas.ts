import z from "zod";

export const RegisterSchema = z
    .object({
        name: z.string("Name is required").min(1, "Name is required"),
        email: z.email().min(1, "Email is required"),
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
