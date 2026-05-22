import { flattenError } from "zod";
import { getUserTwoFactor, updateTwoFactor } from "~/models/twoFactor";
import { ConfirmTwoFactorSchema } from "~/pages/settings/ConfirmTwoFactorModal";
import { getRequiredAuth } from "~/utils/auth";
import { getFormDataToObject } from "~/utils/http";
import {
    generateRecoveryCodes,
    hashRecoveryCodes,
    verifyTotp,
} from "~/utils/two-factor";
import type { Route } from "../../routes/settings/+types/confirm-two-factor";

export async function action({ request, context }: Route.ActionArgs) {
    const auth = getRequiredAuth(context);

    const tfaConfig = await getUserTwoFactor(auth.userId);

    // abort if disabled or confirmed
    if (!tfaConfig || tfaConfig.confirmedAt) {
        return { ok: false } as const;
    }

    const formData = await getFormDataToObject(request);
    const parseResult = await ConfirmTwoFactorSchema.superRefine(
        async (data, ctx) => {
            if (!verifyTotp(tfaConfig.secretKey, data.code)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["code"],
                    message: "The code is invalid",
                });
            }
        },
    ).safeParseAsync(formData);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const recoveryCodes = await generateRecoveryCodes();
    await updateTwoFactor(tfaConfig.id, {
        confirmedAt: new Date(),
        recoveryCodes: hashRecoveryCodes(recoveryCodes),
    });
    return { ok: true, recoveryCodes } as const;
}
