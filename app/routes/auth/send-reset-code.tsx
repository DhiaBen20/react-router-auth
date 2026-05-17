import { flattenError } from "zod";
import { createOtp } from "~/models/otp";
import { findUserByEmail } from "~/models/user";
import { RequestCodeSchema } from "~/pages/forgot-password/components/RequestCodeForm";
import { generateOtp, calculateOtpExpiryDate, hashOtp } from "~/utils/otp";
import type { Route } from "./+types/send-reset-code";

export async function action({ request }: Route.ActionArgs) {
    const parseResult = RequestCodeSchema.safeParse(
        Object.fromEntries(await request.formData()),
    );

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const user = await findUserByEmail(parseResult.data.email);

    if (!user) return { ok: true } as const;

    const randomCode = generateOtp();

    await createOtp({
        otpHash: hashOtp(randomCode),
        userId: user.id,
        expiresAt: calculateOtpExpiryDate(),
    });

    console.log({ otp: randomCode });
    return { ok: true } as const;
}
