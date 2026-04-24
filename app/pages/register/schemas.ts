import z, { type RefinementCtx } from "zod";
import { findUserByEmail } from "~/models/user";

export const RegisterSchema = z
    .object({
        name: z.string("Name is required"),
        email: z.email(),
        password: z
            .string("Password is Required")
            .min(8, "Password must be at least 8 characters long"),
        passwordConfirmation: z.string("Password confirmation is required"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        error: "Passwords don't match",
        path: ["passwordConfirmation"],
    });

export async function uniqueEmailRefinement(
    data: z.infer<typeof RegisterSchema>,
    ctx: RefinementCtx,
) {
    const user = await findUserByEmail(data.email);

    if (user)
        ctx.addIssue({
            code: "custom",
            path: ["email"],
            message: "Email is already in use",
        });
}
