import { redirect } from "react-router";
import { stateCookie } from "~/utils/cookies";
import {
    buildAuthenticationUrl,
    generateStateToken,
} from "~/utils/google-oauth";

export async function action() {
    try {
        const state = generateStateToken();
        const redirectTo = await buildAuthenticationUrl(
            "http://localhost:5173/auth/google/callback",
            state,
        );

        return redirect(redirectTo, {
            headers: { "Set-Cookie": await stateCookie.serialize(state) },
        });
    } catch (e) {
        console.log(e);
        return {
            ok: false,
            error: "Couldn't initiate the sign in, try again later",
        } as const;
    }
}
