import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { requireGuest } from "~/middlewares/requireGuest";
import LoginCard from "~/pages/login/components/LoginCard";
import LoginForm from "~/pages/login/components/LoginForm";
import { LoginSchema } from "~/pages/login/schemas";
import { checkAuthCredentials, login } from "~/utils/auth";
import type { Route } from "./+types/login";

export const middleware: Route.MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

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
    }).safeParseAsync(Object.fromEntries(formData));

    if (!parseResult.success) {
        return { ok: false as const, errors: flattenError(parseResult.error) };
    }

    const headers = await login(
        parseResult.data.user,
        parseResult.data.rememberMe,
    );

    throw redirect("/", { headers });
}

export default function Login() {
    return (
        <LoginCard>
            <LoginForm />
        </LoginCard>
    );
}
