import { deleteTwoFactorForUser } from "~/models/twoFactor";
import { requireAuth } from "~/utils/auth-gurads";
import type { Route } from "../../routes/settings/+types/disable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const contextValue = requireAuth(context);

    await deleteTwoFactorForUser(contextValue.userId);

    return { ok: true } as const;
}
