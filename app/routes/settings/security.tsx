import { useState } from "react";
import type { MiddlewareFunction } from "react-router";
import { requireAuth } from "~/middlewares/requireAuth";
import { getUserTwoFactor } from "~/models/twoFactor";
import { AuthenticatorQrCode } from "~/pages/settings/AuthenticatorQrCode";
import ConfirmTwoFactorModal from "~/pages/settings/ConfirmTwoFactorModal";
import Heading from "~/pages/settings/Heading";
import ManualKeySetup from "~/pages/settings/ManualKeySetup";
import RecoveryCodes from "~/pages/settings/RecoveryCodes";
import TwoFactorSetting from "~/pages/settings/TwoFactorSetting";
import UpdatePasswordForm from "~/pages/settings/UpdatePasswordForm";
import { requireAuth as requireAuthContext } from "~/utils/auth-gurads";
import type { Route } from "./+types/security";
import TwoFactorSetupCard from "./TwoFactorSetupCard";

export const middleware: MiddlewareFunction<Response>[] = [requireAuth];

export async function loader({ context }: Route.LoaderArgs) {
    const contextValue = requireAuthContext(context);

    const twoFactor = await getUserTwoFactor(contextValue.userId);

    return { isTwoFactorActive: Boolean(twoFactor && twoFactor.confirmedAt) };
}

export default function SecuritySettings({ loaderData }: Route.ComponentProps) {
    const [recoveryCodes, setRecoveryCodes] = useState<null | string[]>(null);
    const [tfaConfig, setTfaConfig] = useState<null | {
        otpauth: string;
        secret: string;
    }>(null);

    return (
        <div className="space-y-10">
            <div>
                <Heading
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />
                <UpdatePasswordForm />
            </div>

            <div className="space-y-6">
                <Heading
                    title="Two factor authentication"
                    description="When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone."
                />

                <TwoFactorSetting
                    enabled={loaderData.isTwoFactorActive}
                    onChange={setTfaConfig}
                />

                {!loaderData.isTwoFactorActive && tfaConfig && (
                    <TwoFactorSetupCard>
                        <AuthenticatorQrCode otpauth={tfaConfig.otpauth} />
                        <ManualKeySetup secret={tfaConfig.secret} />
                        <ConfirmTwoFactorModal
                            onSubmitSuccess={setRecoveryCodes}
                        />
                    </TwoFactorSetupCard>
                )}

                {loaderData.isTwoFactorActive && (
                    <RecoveryCodes recoveryCodes={recoveryCodes} />
                )}
            </div>
        </div>
    );
}
