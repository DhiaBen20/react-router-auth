import { useState } from "react";
import { redirect, type MiddlewareFunction } from "react-router";
import { requireAuth } from "~/middlewares/requireAuth";
import EmailVerificationCodeCard from "~/pages/verify-email/components/EmailVerificationCodeCard";
import RequestCodeForm from "~/pages/verify-email/components/RequestCodeForm";
import ResendCodeForm from "~/pages/verify-email/components/ResendCodeForm";
import VerifyCodeForm from "~/pages/verify-email/components/VerifyCodeForm";
import VerifyEmailCard from "~/pages/verify-email/components/VerifyEmailCard";
import { requireAuth as requireAuthContext } from "~/utils/auth-gurads";

export const middleware: MiddlewareFunction<Response>[] = [
    requireAuth,
    ({ context }) => {
        const contextValue = requireAuthContext(context);

        if (contextValue.emailVerified) throw redirect("/");
    },
];

export function loader() {
    return null;
}

export default function VerifyEmail() {
    const [hasSent, setHasSent] = useState(false);

    return !hasSent ? (
        <VerifyEmailCard>
            <RequestCodeForm onSubmitSucces={() => setHasSent(true)} />
        </VerifyEmailCard>
    ) : (
        <EmailVerificationCodeCard>
            <VerifyCodeForm />
            <ResendCodeForm />
        </EmailVerificationCodeCard>
    );
}
