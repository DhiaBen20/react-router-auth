import { useFetcher, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "../../../routes/auth/+types/google";

const messages: Record<string, string> = {
    "access-denied": "Google sign-in was cancelled",
    "invalid-state":
        "The sign-in request could not be verified. Please try again",
    "authentication-failed":
        "Unable to complete Google sign-in. Please try again",
};

export function GoogleSignInForm() {
    const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
    const [searchParams] = useSearchParams();
    const error = searchParams.get("oauth-error") ?? "";

    return (
        <fetcher.Form
            method="post"
            action="/auth/google"
            className="flex flex-col justify-center"
        >
            <Button variant="ghost" isLoading={fetcher.state === "submitting"}>
                Sign in with google
            </Button>

            {fetcher.data && !fetcher.data.ok && (
                <p className="text-destructive text-center text-sm">
                    {fetcher.data.error}
                </p>
            )}
            {messages[error] && (
                <p className="text-destructive text-center text-sm">
                    {messages[error]}
                </p>
            )}
        </fetcher.Form>
    );
}
