import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route as GenerateRecoveryCodesRoute } from "../../routes/settings/+types/generate-recovery-codes";
import Heading from "./Heading";

export default function RecoveryCodes({
    recoveryCodes,
}: {
    recoveryCodes: string[] | null;
}) {
    const fetcher =
        useFetcher<GenerateRecoveryCodesRoute.ComponentProps["actionData"]>();

    recoveryCodes =
        (fetcher.data && fetcher.data.recoveryCodes) || recoveryCodes;

    return (
        <div className="bg-mutedx space-y-4 rounded-xl p-6">
            <Heading
                title="Recovery codes"
                description="Recovery codes let you regain access if you lose your 2FA device. For security reasons, they’ll disappear once you refresh or leave this page."
            />

            <fetcher.Form method="post" action="generate-recovery-codes">
                <Button isLoading={fetcher.state === "submitting"}>
                    Regenerate codes
                </Button>
            </fetcher.Form>

            {recoveryCodes && (
                <>
                    <div className="bg-muted grid gap-1 rounded-lg p-4 text-sm">
                        {recoveryCodes.map((c) => (
                            <span key={c}>{c}</span>
                        ))}
                    </div>
                    <div className="text-muted-foreground text-xs select-none">
                        <p>
                            Each recovery code can be used once to access your
                            account and will be removed after use. If you need
                            more, click{" "}
                            <span className="font-bold">Regenerate codes</span>{" "}
                            above.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
