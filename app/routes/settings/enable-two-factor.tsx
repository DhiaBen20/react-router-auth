import { Secret, TOTP } from "otpauth";
import {
    createTwoFactor,
    getUserTwoFactor,
    updateTwoFactor,
} from "~/models/twoFactor";
import { getRequiredAuth } from "~/utils/auth";
import type { Route } from "./+types/enable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const auth = getRequiredAuth(context);

    const tfaConfig = await getUserTwoFactor(auth.userId);

    if (tfaConfig && tfaConfig.confirmedAt) return { ok: true } as const;

    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
        secret,
        issuer: "React router auth",
        label: auth.userId.toString(),
    });

    if (tfaConfig) {
        await updateTwoFactor(tfaConfig.id, {
            secretKey: secret.base32,
            confirmedAt: null,
            recoveryCodes: null,
        });
    } else {
        await createTwoFactor({
            secretKey: secret.base32,
            userId: auth.userId,
        });
    }

    return {
        ok: true,
        secret: secret.base32,
        otpAuth: totp.toString(),
    } as const;
}
