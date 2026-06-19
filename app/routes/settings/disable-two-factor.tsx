import { db } from "~/db/client";
import { TwoFactorRepository } from "~/repositories/two-factor";
import { requireAuth } from "~/utils/auth-gurads";
import type { Route } from "../../routes/settings/+types/disable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    const twoFactorRepository = new TwoFactorRepository(db);
    await twoFactorRepository.deleteForUser(contextValue.userId);

    return { ok: true } as const;
}
