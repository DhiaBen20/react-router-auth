import type { Cookie } from "react-router";
import { authCookie, refreshCookie } from "./cookies";
import type z from "zod";

export async function getFormDataToObject(request: Request) {
    const formData = await request.formData();

    return Object.fromEntries(formData);
}

export function getSafeReturnTo(body: Record<string, FormDataEntryValue>) {
    const returnTo = body.returnTo;

    if (
        !returnTo ||
        typeof returnTo !== "string" ||
        !(returnTo.startsWith("/") && !returnTo.startsWith("//"))
    ) {
        return null;
    }

    return returnTo;
}

export async function setAuthCookie(value: string, headers = new Headers()) {
    headers.append("Set-Cookie", await authCookie.serialize(value));

    return headers;
}
export async function setRefreshCookie(
    value: string,
    session = false,
    headers = new Headers(),
) {
    const cookieExpire = session ? { maxAge: undefined } : undefined;

    headers.append(
        "Set-Cookie",
        await refreshCookie.serialize(value, cookieExpire),
    );

    return headers;
}

export async function setSessionCookies(
    tokens: { accessToken: string; refreshToken: string },
    rememberMe: boolean,
    headers = new Headers(),
) {
    await setAuthCookie(tokens.accessToken, headers);
    await setRefreshCookie(tokens.refreshToken, !rememberMe, headers);

    return headers;
}

export async function getCurrentAuthTokens(request: Request) {
    const cookie = request.headers.get("Cookie");

    const [authToken, refreshToken] = await Promise.all([
        authCookie.parse(cookie),
        refreshCookie.parse(cookie),
    ]);

    return {
        authToken: typeof authToken === "string" ? authToken : null,
        refreshToken: typeof refreshToken === "string" ? refreshToken : null,
    };
}

export async function destroyAuthCookies(headers = new Headers()) {
    headers.append(
        "Set-Cookie",
        await authCookie.serialize("", { maxAge: -1 }),
    );

    headers.append(
        "Set-Cookie",
        await refreshCookie.serialize("", { maxAge: -1 }),
    );
}

export async function getCookie<T extends z.ZodType>(
    req: Request,
    cookie: Cookie,
    validationSchema: T,
): Promise<z.infer<T> | null> {
    const cookieHeader = req.headers.get("Cookie");

    const unsafeValue = await cookie.parse(cookieHeader);

    const parseResult = validationSchema.safeParse(unsafeValue);

    return parseResult.success ? parseResult.data : null;
}
