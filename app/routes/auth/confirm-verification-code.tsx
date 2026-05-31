import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { findValidOtpByUserId, revokeOtp } from "~/models/otp";
import { updateUser } from "~/models/user";
import { VerifyCodeSchema } from "~/pages/verify-email/components/VerifyCodeForm";
import { requireAuth } from "~/utils/auth-gurads";
import { signAccessToken } from "~/utils/auth-tokens";
import {
    getFormDataToObject,
    getSafeReturnTo,
    setAuthCookie,
} from "~/utils/http";
import { hashOtp } from "~/utils/otp";
import type { Route } from "./+types/confirm-verification-code";

export async function action({ request, context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    const form = await getFormDataToObject(request);

    const parseResult = await VerifyCodeSchema.transform(
        async ({ code }, ctx) => {
            const otpMatch = await findValidOtpByUserId(
                contextValue.userId,
                hashOtp(code),
            );

            if (!otpMatch) {
                ctx.addIssue({
                    code: "custom",
                    path: ["code"],
                    message: "Verification code is incorrect or expired",
                });

                return NEVER;
            }

            return { code, otpMatch };
        },
    ).safeParseAsync(form);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const updatedUser = await updateUser(contextValue.userId, {
        emailVerifiedAt: new Date(),
    });
    await revokeOtp(parseResult.data.otpMatch.id);

    const jwt = await signAccessToken(updatedUser);
    const headers = await setAuthCookie(jwt);
    const returnTo = getSafeReturnTo(form);

    throw redirect(returnTo ?? "/", { headers });
}
