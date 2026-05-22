import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { findValidOtpByUserId, revokeOtp } from "~/models/otp";
import { updateUser } from "~/models/user";
import { VerifyCodeSchema } from "~/pages/verify-email/components/VerifyCodeForm";
import { signAuthToken } from "~/utils/auth-tokens";
import { authContext } from "~/utils/contexts";
import { authCookie } from "~/utils/cookies";
import { getReturnTo, isSafePath, getFormDataToObject } from "~/utils/http";
import { hashOtp } from "~/utils/otp";
import type { Route } from "./+types/confirm-verification-code";

export async function action({ request, context }: Route.ActionArgs) {
    const auth = context.get(authContext)!;
    const form = await getFormDataToObject(request);

    const parseResult = await VerifyCodeSchema.transform(
        async ({ code }, ctx) => {
            const otpMatch = await findValidOtpByUserId(
                auth.userId,
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

    const user = await updateUser(auth.userId, { emailVerifiedAt: new Date() });
    await revokeOtp(parseResult.data.otpMatch.id);

    const jwt = await signAuthToken(
        {
            type: "auth",
            userId: user.id,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );

    const headers = new Headers();
    headers.append("Set-Cookie", await authCookie.serialize(jwt));
    const returnTo = getReturnTo(form) ?? "";

    throw redirect(isSafePath(returnTo) ? returnTo : "/", { headers });
}
