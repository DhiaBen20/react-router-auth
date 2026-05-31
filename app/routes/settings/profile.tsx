import { data } from "react-router";
import { flattenError } from "zod";
import { requireAuth } from "~/middlewares/requireAuth";
import { findUserByEmail, updateUser } from "~/models/user";
import Heading from "~/pages/settings/Heading";
import ProfileInfoForm, {
    ProfileInfoSchema,
} from "~/pages/settings/ProfileInfoForm";
import { requireAuthUser } from "~/utils/auth-gurads";
import { signAccessToken } from "~/utils/auth-tokens";
import { getFormDataToObject, setAuthCookie } from "~/utils/http";
import type { Route } from "./+types/profile";

export const middleware = [requireAuth];

export async function loader({ context }: Route.LoaderArgs) {
    const user = await requireAuthUser(context);

    return {
        ok: true,
        profileInfo: {
            email: user.email,
            name: user.name,
        },
    } as const;
}

export async function action({ request, context }: Route.ActionArgs) {
    const user = await requireAuthUser(context);

    const form = await getFormDataToObject(request);
    const parseResult = await ProfileInfoSchema.superRefine(
        async (data, ctx) => {
            const user = await findUserByEmail(data.email);

            if (user) {
                ctx.addIssue({
                    code: "custom",
                    path: ["email"],
                    message: "Email is already in use",
                });
            }
        },
    ).safeParseAsync(form);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const { email, name } = parseResult.data;
    const updatedEmail = user.email !== email;
    const updatedUser = await updateUser(user.id, {
        email: email,
        name: name,
        emailVerifiedAt: updatedEmail ? null : undefined,
    });

    const headers = new Headers();
    if (updatedEmail) {
        const jwt = await signAccessToken(updatedUser);

        await setAuthCookie(jwt, headers);
    }

    return data({ ok: true } as const, { headers });
}

export default function ProfileSettings() {
    return (
        <div>
            <Heading
                title="Profile information"
                description="Update your name and email address"
            />

            <ProfileInfoForm />
        </div>
    );
}
