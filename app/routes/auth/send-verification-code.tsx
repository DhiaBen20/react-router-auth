import { db } from "~/db/client";
import { OtpRepository } from "~/repositories/otp";
import { requireAuth } from "~/utils/auth-gurads";
import { calculateOtpExpiryDate, generateOtp, hashOtp } from "~/utils/otp";
import type { Route } from "./+types/send-verification-code";

export async function action({ context }: Route.ActionArgs) {
    const auth = requireAuth(context);

    const otpRepository = new OtpRepository(db);
    await otpRepository.updateForUser(auth.userId, { expiresAt: new Date() });
    const randomOtp = generateOtp();
    await otpRepository.create({
        otpHash: hashOtp(randomOtp),
        expiresAt: calculateOtpExpiryDate(),
        userId: auth.userId,
    });
    console.log({ otp: randomOtp });
    return { ok: true } as const;
}
