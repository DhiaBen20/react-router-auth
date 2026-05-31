import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { getUserTwoFactor, updateTwoFactor } from "~/models/twoFactor";
import { RecoveryCodeSchema } from "~/pages/two-factor-verification/components/RecoveryCodeForm";
import { issueSessionTokens } from "~/utils/auth";
import { requireTwoFactor, requireTwoFactorUser } from "~/utils/auth-gurads";
import {
    getFormDataToObject,
    getSafeReturnTo,
    setSessionCookies,
} from "~/utils/http";
import { hashRecoveryCode } from "~/utils/two-factor";
import type { Route } from "./+types/verify-recovery-code";

export async function action({ request, context }: Route.ActionArgs) {
    const formData = await getFormDataToObject(request);
    const contextValue = requireTwoFactor(context);
    const user = await requireTwoFactorUser(context);
    const twoFactor = await getUserTwoFactor(contextValue.userId);

    if (!twoFactor) {
        return { ok: false } as const;
    }

    const recoveryCodes = twoFactor.recoveryCodes;

    if (!Array.isArray(recoveryCodes)) {
        return { ok: false } as const;
    }

    const parseResult = RecoveryCodeSchema.transform((data, ctx) => {
        const hashedRecoveryCode = hashRecoveryCode(data.recoveryCode);

        if (!recoveryCodes.includes(hashedRecoveryCode)) {
            ctx.addIssue({
                code: "custom",
                path: ["recoveryCode"],
                message: "The recovery code is invalid",
            });
            return NEVER;
        }
        return {
            ...data,
            remainingCodes: recoveryCodes.filter(
                (code) => code !== hashedRecoveryCode,
            ),
        };
    }).safeParse(formData);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    await updateTwoFactor(twoFactor.id, {
        recoveryCodes: parseResult.data.remainingCodes,
    });

    const { accessToken, refreshToken } = await issueSessionTokens(
        user,
        contextValue.rememberMe,
    );

    const headers = await setSessionCookies(
        { accessToken, refreshToken },
        contextValue.rememberMe,
    );

    throw redirect(getSafeReturnTo(formData) ?? "/", { headers });
}
