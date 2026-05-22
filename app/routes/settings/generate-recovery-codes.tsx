import { getUserTwoFactor, updateTwoFactor } from "~/models/twoFactor";
import { getRequiredAuth } from "~/utils/auth";
import { generateRecoveryCodes, hashRecoveryCodes } from "~/utils/two-factor";
import type { Route } from "./+types/generate-recovery-codes";

export async function action({ context }: Route.ActionArgs) {
    const auth = getRequiredAuth(context);
    const tfaConfig = await getUserTwoFactor(auth.userId);

    if (!tfaConfig || !tfaConfig.confirmedAt) return { ok: false } as const;

    const recoveryCodes = await generateRecoveryCodes();

    await updateTwoFactor(tfaConfig.id, {
        recoveryCodes: hashRecoveryCodes(recoveryCodes),
    });

    return { ok: true, recoveryCodes } as const;
}
