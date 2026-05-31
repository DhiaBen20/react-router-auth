import { redirect } from "react-router";
import { flattenError } from "zod";
import { getUserTwoFactor } from "~/models/twoFactor";
import { VerifyCodeSchema } from "~/pages/two-factor-verification/components/VerifyCodeForm";
import { issueSessionTokens } from "~/utils/auth";
import { requireTwoFactor, requireTwoFactorUser } from "~/utils/auth-gurads";
import {
    getFormDataToObject,
    getSafeReturnTo,
    setSessionCookies,
} from "~/utils/http";
import { verifyTotp } from "~/utils/two-factor";
import type { Route } from "./+types/verify-totp";

export async function action({ request, context }: Route.ActionArgs) {
    const contextValue = requireTwoFactor(context);
    const body = await getFormDataToObject(request);
    const user = await requireTwoFactorUser(context);
    const twoFactor = await getUserTwoFactor(user.id);

    if (!twoFactor) {
        return { ok: false } as const;
    }

    const parseResult = await VerifyCodeSchema.superRefine(
        async (data, ctx) => {
            if (!verifyTotp(twoFactor.secretKey, data.code)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["code"],
                    message: "The code is invalid",
                });
            }
        },
    ).safeParseAsync(body);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const { accessToken, refreshToken } = await issueSessionTokens(
        user,
        contextValue.rememberMe,
    );

    const headers = await setSessionCookies(
        { accessToken, refreshToken },
        contextValue.rememberMe,
    );

    throw redirect(getSafeReturnTo(body) ?? "/", { headers });
}
