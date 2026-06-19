import { redirect } from "react-router";
import z from "zod";
import { findOrCreateGoogleUser, issueSessionTokens } from "~/utils/auth";
import { stateCookie } from "~/utils/cookies";
import { exchangeTokens, verifyIdToken } from "~/utils/google-oauth";
import { getCookie, setSessionCookies } from "~/utils/http";
import type { Route } from "./+types/google-callback";

export async function loader({ request }: Route.LoaderArgs) {
    const state = await getCookie(request, stateCookie, z.string());
    const currentUrl = new URL(request.url);

    if (currentUrl.searchParams.get("error")) {
        return redirect("/login?oauth-error=access-denied");
    }

    if (currentUrl.searchParams.get("state") !== state) {
        throw redirect("/login?oauth-error=invalid-state");
    }

    try {
        const googleTokens = await exchangeTokens(
            currentUrl.searchParams.get("code")!,
            "http://localhost:5173/auth/google/callback",
        );
        const payload = await verifyIdToken(googleTokens.id_token);
        if (!payload) throw new Error("Id token is not valid");
        const user = await findOrCreateGoogleUser(payload);
        const tokens = await issueSessionTokens(user, false);
        const headers = await setSessionCookies(tokens, false);
        return redirect("/", { headers });
    } catch (e) {
        console.log(e);
        return redirect("/login?oauth-error=authentication-failed");
    }
}
