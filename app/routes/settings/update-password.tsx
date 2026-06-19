import { compare, hash } from "bcrypt";
import type { ActionFunctionArgs } from "react-router";
import { flattenError } from "zod";
import { db } from "~/db/client";
import { UpdatePasswordSchema } from "~/pages/settings/UpdatePasswordForm";
import { UserRepository } from "~/repositories/user";
import { requireAuthUser } from "~/utils/auth-gurads";
import { getFormDataToObject } from "~/utils/http";

export async function action({ context, request }: ActionFunctionArgs) {
    const user = await requireAuthUser(context);
    const formData = await getFormDataToObject(request);

    const parseResult = await UpdatePasswordSchema.superRefine(
        async (data, ctx) => {
            const passwordsMatch =
                !!user.password &&
                (await compare(data.currentPassword, user.password));

            if (!passwordsMatch) {
                ctx.addIssue({
                    message: "The current password is incorrect",
                    code: "custom",
                    path: ["currentPassword"],
                });
            }
        },
    ).safeParseAsync(formData);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const userRepository = new UserRepository(db);
    await userRepository.update(user.id, {
        password: await hash(parseResult.data.newPassword, 10),
    });

    return { ok: true } as const;
}
