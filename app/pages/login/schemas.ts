import z, { type RefinementCtx } from "zod";
import { checkAuthCredentials } from "~/utils/auth";

export const LoginSchema = z.object({
    email: z.email(),
    password: z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters long"),
});

export async function validateCredentials(
    data: z.infer<typeof LoginSchema>,
    ctx: RefinementCtx,
) {
    const user = await checkAuthCredentials(data);

    if (!user) {
        ctx.addIssue({
            code: "custom",
            path: ["email"],
            message: "Invalid credentials",
        });

        return z.NEVER;
    }

    return { ...data, user };
}
