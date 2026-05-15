import { hash } from "bcrypt";
import { redirect } from "react-router";
import { flattenError } from "zod";
import { updateUserPassword } from "~/models/user";
import ResetPasswordCard from "~/pages/reset-password/ResetPasswordCard";
import ResetPasswordForm from "~/pages/reset-password/ResetPasswordForm";
import ResetPasswordSchema from "~/pages/reset-password/schemas/ResetPasswordSchema";
import { destroyAuthCookies } from "~/utils/auth-tokens";
import { authContext } from "~/utils/contexts";
import type { Route } from "./+types/reset-password";

export const middleware: Route.MiddlewareFunction[] = [
    function ({ context }) {
        const value = context.get(authContext);
        if (value && value.type === "reset-password") return;

        throw redirect("/login");
    },
];

export async function action({ request, context }: Route.ActionArgs) {
    const parseResult = ResetPasswordSchema.safeParse(
        Object.fromEntries(await request.formData()),
    );

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const auth = context.get(authContext)!;

    await updateUserPassword(
        auth.userId,
        await hash(parseResult.data.password, 10),
    );

    const response = redirect("/login");
    await destroyAuthCookies(response.headers);
    throw response;
}

export default function ResetPassword() {
    return (
        <ResetPasswordCard>
            <ResetPasswordForm />
        </ResetPasswordCard>
    );
}
