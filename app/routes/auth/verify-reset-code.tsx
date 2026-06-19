import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { db } from "~/db/client";
import { VerifyCodeSchema } from "~/pages/forgot-password/components/VerifyCodeForm";
import { OtpRepository } from "~/repositories/otp";
import { UserRepository } from "~/repositories/user";
import { signResetPasswordToken } from "~/utils/auth-tokens";
import { setAuthCookie } from "~/utils/http";
import { hashOtp } from "~/utils/otp";
import type { Route } from "./+types/verify-reset-code";

export async function action({ request }: Route.ActionArgs) {
    const userRepository = new UserRepository(db);
    const otpRepository = new OtpRepository(db);

    const parseResult = await VerifyCodeSchema.transform(async (data, ctx) => {
        const user = await userRepository.findByEmail(data.email);

        const otpMatch = user
            ? await otpRepository.findValidOtp(user.id, hashOtp(data.code))
            : null;

        if (!otpMatch || !user) {
            ctx.addIssue({
                code: "custom",
                path: ["code"],
                message: "Verification code is incorrect or expired",
            });

            return NEVER;
        }

        return { ...data, user, otpMatch };
    }).safeParseAsync(Object.fromEntries(await request.formData()));

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) };
    }

    const { user, otpMatch } = parseResult.data;

    await otpRepository.update(otpMatch.id, { expiresAt: new Date() });

    const jwt = await signResetPasswordToken(user);
    const headers = await setAuthCookie(jwt);
    return redirect("/reset-password", { headers });
}
