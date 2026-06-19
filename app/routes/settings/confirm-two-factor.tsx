import { flattenError } from "zod";
import { db } from "~/db/client";
import { ConfirmTwoFactorSchema } from "~/pages/settings/ConfirmTwoFactorModal";
import { TwoFactorRepository } from "~/repositories/two-factor";
import { requireAuth } from "~/utils/auth-gurads";
import { getFormDataToObject } from "~/utils/http";
import {
    generateRecoveryCodes,
    hashRecoveryCodes,
    verifyTotp,
} from "~/utils/two-factor";
import type { Route } from "../../routes/settings/+types/confirm-two-factor";

export async function action({ request, context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    const twoFactorRepository = new TwoFactorRepository(db);

    const twoFactor = await twoFactorRepository.findForUser(
        contextValue.userId,
    );

    // abort if disabled or confirmed
    if (!twoFactor || twoFactor.confirmedAt) {
        return { ok: false } as const;
    }

    const formData = await getFormDataToObject(request);
    const parseResult = await ConfirmTwoFactorSchema.superRefine(
        async (data, ctx) => {
            if (!verifyTotp(twoFactor.secretKey, data.code)) {
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

    const recoveryCodes = generateRecoveryCodes();
    await twoFactorRepository.update(twoFactor.id, {
        confirmedAt: new Date(),
        recoveryCodes: hashRecoveryCodes(recoveryCodes),
    });
    return { ok: true, recoveryCodes } as const;
}
