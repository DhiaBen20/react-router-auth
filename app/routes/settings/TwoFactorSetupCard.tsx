import type { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export default function TwoFactorSetupCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Setup Two factor</CardTitle>
                <CardDescription>
                    Download Google Authenticator or any TOTP-supported
                    application on your phone. Open the app and scan QR code.
                </CardDescription>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
}
