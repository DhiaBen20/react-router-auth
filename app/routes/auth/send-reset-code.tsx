import { flattenError } from "zod";
import { db } from "~/db/client";
import { RequestCodeSchema } from "~/pages/forgot-password/components/RequestCodeForm";
import { OtpRepository } from "~/repositories/otp";
import { UserRepository } from "~/repositories/user";
import { calculateOtpExpiryDate, generateOtp, hashOtp } from "~/utils/otp";
import type { Route } from "./+types/send-reset-code";

export async function action({ request }: Route.ActionArgs) {
    const parseResult = RequestCodeSchema.safeParse(
        Object.fromEntries(await request.formData()),
    );

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const userRepository = new UserRepository(db);
    const otpRepository = new OtpRepository(db);
    const user = await userRepository.findByEmail(parseResult.data.email);

    if (!user) return { ok: true } as const;

    const randomCode = generateOtp();

    await otpRepository.updateForUser(user.id, { expiresAt: new Date() });
    await otpRepository.create({
        otpHash: hashOtp(randomCode),
        userId: user.id,
        expiresAt: calculateOtpExpiryDate(),
    });

    console.log({ otp: randomCode });
    return { ok: true } as const;
}
