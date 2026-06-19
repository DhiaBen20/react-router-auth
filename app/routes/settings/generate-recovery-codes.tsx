import { requireAuth } from "~/utils/auth-gurads";
import { generateRecoveryCodes, hashRecoveryCodes } from "~/utils/two-factor";
import type { Route } from "./+types/generate-recovery-codes";
import { TwoFactorRepository } from "~/repositories/two-factor";
import { db } from "~/db/client";

export async function action({ context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);
    const twoFactorRepository = new TwoFactorRepository(db);
    const tfaConfig = await twoFactorRepository.findForUser(
        contextValue.userId,
    );

    if (!tfaConfig || !tfaConfig.confirmedAt) return { ok: false } as const;

    const recoveryCodes = generateRecoveryCodes();

    await twoFactorRepository.update(tfaConfig.id, {
        recoveryCodes: hashRecoveryCodes(recoveryCodes),
    });

    return { ok: true, recoveryCodes } as const;
}
