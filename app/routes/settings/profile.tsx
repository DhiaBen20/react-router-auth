import { data } from "react-router";
import { flattenError } from "zod";
import { requireAuth } from "~/middlewares/requireAuth";
import { findUser, updateUser } from "~/models/user";
import ProfileInfoForm, {
    ProfileInfoSchema,
} from "~/pages/settings/ProfileInfoForm";
import { getRequiredUser } from "~/utils/auth";
import { signAuthToken } from "~/utils/auth-tokens";
import { authContext } from "~/utils/contexts";
import { authCookie } from "~/utils/cookies";
import { getFormDataToObject } from "~/utils/http";
import type { Route } from "./+types/profile";
import Heading from "~/pages/settings/Heading";

export const middleware = [requireAuth];

export async function loader({ context }: Route.LoaderArgs) {
    const auth = context.get(authContext)!;

    const user = await findUser(auth.userId);

    if (!user) {
        throw new Error(
            "could'nt find the auth user, make sure to use requireAuth middleware",
        );
    }

    return {
        ok: true,
        profileInfo: {
            email: user.email,
            name: user.name,
        },
    } as const;
}

export async function action({ request, context }: Route.ActionArgs) {
    const user = await getRequiredUser(context);

    const form = await getFormDataToObject(request);
    const parseResult = ProfileInfoSchema.safeParse(form);

    if (!parseResult.success) {
        return { ok: false, errors: flattenError(parseResult.error) } as const;
    }

    const { email, name } = parseResult.data;
    const updatedEmail = user.email !== email;
    await updateUser(user.id, {
        email: email,
        name: name,
        emailVerifiedAt: updatedEmail ? null : undefined,
    });

    const headers = new Headers();
    if (updatedEmail) {
        const jwt = await signAuthToken(
            { type: "auth", userId: user.id, emailVerified: false },
            "15m",
        );

        headers.append("Set-Cookie", await authCookie.serialize(jwt));
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
