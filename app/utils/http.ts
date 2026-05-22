export async function getFormDataToObject(request: Request) {
    const formData = await request.formData();

    return Object.fromEntries(formData);
}

export function isSafePath(path: string): path is string {
    return Boolean(path) && path.startsWith("/") && !path.startsWith("//");
}

export function getReturnTo(body: Record<string, FormDataEntryValue>) {
    const returnTo = body.returnTo;

    return typeof returnTo === "string" ? returnTo : null;
}
