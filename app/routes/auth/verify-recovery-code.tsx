import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { db } from "~/db/client";
import { RecoveryCodeSchema } from "~/pages/two-factor-verification/components/RecoveryCodeForm";
import { TwoFactorRepository } from "~/repositories/two-factor";
import { UserRepository } from "~/repositories/user";
import { issueSessionTokens } from "~/utils/auth";
import { requireTwoFactor } from "~/utils/auth-gurads";
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

    const userRepository = new UserRepository(db);
    const userWithTwoFactor = await userRepository.findUserWithTwoFactor(
        contextValue.userId,
    );

    if (!userWithTwoFactor || !userWithTwoFactor.twoFactor) {
        return { ok: false } as const;
    }

    const { user, twoFactor } = userWithTwoFactor;

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

    const twoFactorRepository = new TwoFactorRepository(db);
    await twoFactorRepository.update(twoFactor.id, {
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
