import { useState } from "react";
import ForgotPasswordCard from "~/pages/forgot-password/components/ForgotPasswordCard";
import ForgotPasswordForm from "~/pages/forgot-password/components/ForgotPasswordForm";
import ResetCodeVerificationCard from "~/pages/forgot-password/components/ResetCodeVerificationCard";
import ResetCodeVerificationForm from "~/pages/forgot-password/components/ResetCodeVerificationForm";

export default function ForgotPassword() {
    const [submittedEmail, setSubmittedEmail] = useState("");

    return (
        <>
            {!submittedEmail ? (
                <ForgotPasswordCard>
                    <ForgotPasswordForm onSubmitSuccess={setSubmittedEmail} />
                </ForgotPasswordCard>
            ) : (
                <ResetCodeVerificationCard>
                    <ResetCodeVerificationForm email={submittedEmail} />
                </ResetCodeVerificationCard>
            )}
        </>
    );
}
