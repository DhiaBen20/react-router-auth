import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { requireGuest } from "~/middlewares/requireGuest";
import LoginCard from "~/pages/login/components/LoginCard";
import LoginForm, { LoginSchema } from "~/pages/login/components/LoginForm";
import { authenticate } from "~/utils/auth";
import {
    getFormDataToObject,
    getSafeReturnTo,
    setAuthCookie,
    setSessionCookies,
} from "~/utils/http";
import type { Route } from "./+types/login";

export const middleware: Route.MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await getFormDataToObject(request);

    const parseResult = await LoginSchema.transform(async (data, ctx) => {
        const authenticateResult = await authenticate(data);

        if (!authenticateResult) {
            ctx.addIssue({
                code: "custom",
                path: ["email"],
                message: "Invalid credentials",
            });

            return NEVER;
        }

        return { ...data, ...authenticateResult };
    }).safeParseAsync(formData);

    if (!parseResult.success) {
        return { ok: false as const, errors: flattenError(parseResult.error) };
    }

    const {
        rememberMe,
        enabledTfa,
        twoFactorToken,
        accessToken,
        refreshToken,
    } = parseResult.data;

    const returnTo = getSafeReturnTo(formData);

    if (enabledTfa) {
        const headers = await setAuthCookie(twoFactorToken);

        throw redirect(
            "/two-factor-challenge" + (returnTo ? `?returnTo=${returnTo}` : ""),
            {
                headers,
            },
        );
    }

    const headers = await setSessionCookies(
        { accessToken, refreshToken },
        rememberMe,
    );

    throw redirect(returnTo ?? "/", { headers });
}

export default function Login() {
    return (
        <LoginCard>
            <LoginForm />
        </LoginCard>
    );
}
