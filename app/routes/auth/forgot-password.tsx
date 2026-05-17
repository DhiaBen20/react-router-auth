import { useState } from "react";
import { requireGuest } from "~/middlewares/requireGuest";
import ForgotPasswordCard from "~/pages/forgot-password/components/ForgotPasswordCard";
import PasswordResetCodeCard from "~/pages/forgot-password/components/PasswordResetCodeCard";
import RequestCodeForm from "~/pages/forgot-password/components/RequestCodeForm";
import ResendCodeForm from "~/pages/forgot-password/components/ResendCodeForm";
import VerifyCodeForm from "~/pages/forgot-password/components/VerifyCodeForm";

export const middleware = [requireGuest];

export function loader() {
    return null;
}

export default function ForgotPassword() {
    const [submittedEmail, setSubmittedEmail] = useState("");

    return (
        <>
            {!submittedEmail ? (
                <ForgotPasswordCard>
                    <RequestCodeForm onSubmitSuccess={setSubmittedEmail} />
                </ForgotPasswordCard>
            ) : (
                <PasswordResetCodeCard>
                    <VerifyCodeForm email={submittedEmail} />
                    <ResendCodeForm email={submittedEmail} />
                </PasswordResetCodeCard>
            )}
        </>
    );
}
