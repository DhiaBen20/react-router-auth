import { useState } from "react";
import { twoFactorPending } from "~/middlewares/twoFactorPending";
import RecoveryCodeForm from "~/pages/two-factor-verification/components/RecoveryCodeForm";
import TwoFactorRecoveryCard from "~/pages/two-factor-verification/components/TwoFactorRecoveryCard";
import TwoFactorVerificationCard from "~/pages/two-factor-verification/components/TwoFactorVerificationCard";
import VerifyCodeForm from "~/pages/two-factor-verification/components/VerifyCodeForm";
import type { Route } from "./+types/two-factor-challenge";

export const middleware: Route.MiddlewareFunction[] = [twoFactorPending];

export function loader() {
    return null;
}

export default function TwoFactorChallenge() {
    const [showRecoveryForm, setShowRecoveryForm] = useState(false);

    return (
        <>
            {!showRecoveryForm ? (
                <TwoFactorVerificationCard>
                    <VerifyCodeForm />
                </TwoFactorVerificationCard>
            ) : (
                <TwoFactorRecoveryCard>
                    <RecoveryCodeForm />
                </TwoFactorRecoveryCard>
            )}

            <div className="text-muted-foreground mt-4 text-center text-sm">
                or you can{" "}
                <button
                    className="text-accent-foreground cursor-pointer hover:underline"
                    onClick={() => setShowRecoveryForm(!showRecoveryForm)}
                >
                    {!showRecoveryForm
                        ? "login using a recovery code"
                        : "login using an authentication code"}
                </button>
            </div>
        </>
    );
}
