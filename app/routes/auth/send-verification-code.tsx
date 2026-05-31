import { createOtp } from "~/models/otp";
import { requireAuth } from "~/utils/auth-gurads";
import { calculateOtpExpiryDate, generateOtp, hashOtp } from "~/utils/otp";
import type { Route } from "./+types/send-verification-code";

export async function action({ context }: Route.ActionArgs) {
    const auth = requireAuth(context);

    const randomOtp = generateOtp();

    await createOtp({
        otpHash: hashOtp(randomOtp),
        expiresAt: calculateOtpExpiryDate(),
        userId: auth.userId,
    });

    console.log({ otp: randomOtp });

    return { ok: true } as const;
}
