import { hash } from "bcrypt";
import { redirect } from "react-router";
import { flattenError } from "zod";
import { canResetPassword } from "~/middlewares/canResetPassword";
import { updateUserPassword } from "~/models/user";
import ResetPasswordCard from "~/pages/reset-password/components/ResetPasswordCard";
import ResetPasswordForm, {
    ResetPasswordSchema,
} from "~/pages/reset-password/components/ResetPasswordForm";
import { requireResetPassword } from "~/utils/auth-gurads";
import { destroyAuthCookies } from "~/utils/http";
import type { Route } from "./+types/reset-password";

export const middleware: Route.MiddlewareFunction[] = [canResetPassword];

export async function action({ request, context }: Route.ActionArgs) {
    const parseResult = ResetPasswordSchema.safeParse(
        Object.fromEntries(await request.formData()),
    );

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const contextValue = requireResetPassword(context);

    await updateUserPassword(
        contextValue.userId,
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
