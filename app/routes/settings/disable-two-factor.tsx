import { deleteTwoFactorForUser } from "~/models/twoFactor";
import { getRequiredAuth } from "~/utils/auth";
import type { Route } from "../../routes/settings/+types/disable-two-factor";

export async function action({ context }: Route.ActionArgs) {
    const auth = getRequiredAuth(context);

    await deleteTwoFactorForUser(auth.userId);

    return { ok: true } as const;
}
