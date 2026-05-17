import { createOtp } from "~/models/otp";
import { authContext } from "~/utils/contexts";
import { calculateOtpExpiryDate, generateOtp, hashOtp } from "~/utils/otp";
import type { Route } from "./+types/send-verification-code";

export async function action({ context }: Route.ActionArgs) {
    const auth = context.get(authContext)!;

    const randomOtp = generateOtp();

    await createOtp({
        otpHash: hashOtp(randomOtp),
        expiresAt: calculateOtpExpiryDate(),
        userId: auth.userId,
    });

    console.log({ otp: randomOtp });

    return { ok: true } as const;
}
