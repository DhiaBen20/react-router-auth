import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { requireGuest } from "~/middlewares/requireGuest";
import LoginCard from "~/pages/login/components/LoginCard";
import LoginForm, { LoginSchema } from "~/pages/login/components/LoginForm";
import { checkAuthCredentials, login } from "~/utils/auth";
import { getReturnTo, isSafePath, requestBody } from "~/utils/http";
import type { Route } from "./+types/login";

export const middleware: Route.MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await requestBody(request);

    const parseResult = await LoginSchema.transform(async (data, ctx) => {
        const user = await checkAuthCredentials(data);

        if (!user) {
            ctx.addIssue({
                code: "custom",
                path: ["email"],
                message: "Invalid credentials",
            });

            return NEVER;
        }

        return { ...data, user };
    }).safeParseAsync(formData);

    if (!parseResult.success) {
        return { ok: false as const, errors: flattenError(parseResult.error) };
    }

    const { user, rememberMe } = parseResult.data;

    const headers = await login(user, rememberMe);
    const returnTo = getReturnTo(formData) ?? "";

    throw redirect(isSafePath(returnTo) ? returnTo : "/", { headers });
}

export default function Login() {
    return (
        <LoginCard>
            <LoginForm />
        </LoginCard>
    );
}
