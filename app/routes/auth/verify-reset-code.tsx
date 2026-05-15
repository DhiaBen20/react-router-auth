import { redirect } from "react-router";
import { flattenError, NEVER } from "zod";
import { findValidOtpByUserId, revokeOtp } from "~/models/otp";
import { findUserByEmail } from "~/models/user";
import { VerifyResetCodeSchema } from "~/pages/forgot-password/schemas/VerifyResetCodeSchema";
import { signAuthToken } from "~/utils/auth-tokens";
import { authCookie } from "~/utils/cookies";
import { hashOtp } from "~/utils/otp";
import type { Route } from "./+types/verify-reset-code";

export async function action({ request }: Route.ActionArgs) {
    const parseResult = await VerifyResetCodeSchema.transform(
        async (data, ctx) => {
            const user = await findUserByEmail(data.email);

            const otpMatch = user
                ? await findValidOtpByUserId(user.id, hashOtp(data.code))
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
        },
    ).safeParseAsync(Object.fromEntries(await request.formData()));

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) };
    }

    const { user, otpMatch } = parseResult.data;

    await revokeOtp(otpMatch.id);

    const jwt = await signAuthToken(
        {
            type: "reset-password",
            userId: user.id,
            emailVerified: Boolean(user.emailVerifiedAt),
        },
        "15m",
    );

    const headers = new Headers();
    headers.append("Set-Cookie", await authCookie.serialize(jwt));
    return redirect("/reset-password", { headers });
}
