import { redirect, type MiddlewareFunction } from "react-router";
import { flattenError } from "zod";
import { requireGuest } from "~/db/middlewares/requireGuest";
import LoginCard from "~/pages/login/components/LoginCard";
import LoginForm from "~/pages/login/components/LoginForm";
import { LoginSchema, validateCredentials } from "~/pages/login/schemas";
import { login } from "~/utils/auth";
import type { Route } from "./+types/login";

export const middleware: MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const parseResult = await LoginSchema.transform(
        validateCredentials,
    ).safeParseAsync(Object.fromEntries(formData));

    if (!parseResult.success) {
        return { ok: false as const, errors: flattenError(parseResult.error) };
    }

    const headers = await login(parseResult.data.user);

    throw redirect("/", { headers });
}

export default function Login() {
    return (
        <LoginCard>
            <LoginForm />
        </LoginCard>
    );
}
