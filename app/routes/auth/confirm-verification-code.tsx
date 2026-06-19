import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { db } from "~/db/client";
import { VerifyCodeSchema } from "~/pages/verify-email/components/VerifyCodeForm";
import { OtpRepository } from "~/repositories/otp";
import { UserRepository } from "~/repositories/user";
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
    const otpRepository = new OtpRepository(db);
    const userRespository = new UserRepository(db);
    const parseResult = await VerifyCodeSchema.transform(
        async ({ code }, ctx) => {
            const otpMatch = await otpRepository.findValidOtp(
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

    const updatedUser = await userRespository.update(contextValue.userId, {
        emailVerifiedAt: new Date(),
    });
    await otpRepository.update(parseResult.data.otpMatch.id, {
        usedAt: new Date(),
    });

    const jwt = await signAccessToken(updatedUser);
    const headers = await setAuthCookie(jwt);
    const returnTo = getSafeReturnTo(form);

    throw redirect(returnTo ?? "/", { headers });
}
