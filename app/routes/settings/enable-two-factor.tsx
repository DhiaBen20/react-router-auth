import { Secret, TOTP } from "otpauth";
import {
    createTwoFactor,
    getUserTwoFactor,
    updateTwoFactor,
} from "~/models/twoFactor";
import { requireAuth } from "~/utils/auth-gurads";
import type { Route } from "./+types/enable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    const twoFactor = await getUserTwoFactor(contextValue.userId);

    if (twoFactor && twoFactor.confirmedAt) return { ok: true } as const;

    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
        secret,
        issuer: "React router auth",
        label: contextValue.userId.toString(),
    });

    if (twoFactor) {
        await updateTwoFactor(twoFactor.id, {
            secretKey: secret.base32,
            confirmedAt: null,
            recoveryCodes: null,
        });
    } else {
        await createTwoFactor({
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
