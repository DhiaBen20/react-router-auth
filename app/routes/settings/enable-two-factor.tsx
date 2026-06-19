import { Secret, TOTP } from "otpauth";
import { db } from "~/db/client";
import { TwoFactorRepository } from "~/repositories/two-factor";
import { requireAuth } from "~/utils/auth-gurads";
import type { Route } from "./+types/enable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    const twoFactorRepository = new TwoFactorRepository(db);
    const twoFactor = await twoFactorRepository.findForUser(
        contextValue.userId,
    );

    if (twoFactor && twoFactor.confirmedAt) return { ok: true } as const;

    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
        secret,
        issuer: "React router auth",
        label: contextValue.userId.toString(),
    });

    if (twoFactor) {
        await twoFactorRepository.update(twoFactor.id, {
            secretKey: secret.base32,
            confirmedAt: null,
            recoveryCodes: null,
        });
    } else {
        await twoFactorRepository.create({
            secretKey: secret.base32,
            userId: contextValue.userId,
        });
    }

    return {
        ok: true,
        secret: secret.base32,
        otpAuth: totp.toString(),
    } as const;
}
