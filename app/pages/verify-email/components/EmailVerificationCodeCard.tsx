import type { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export default function EmailVerificationCodeCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                    We’ve sent a verification code to your email. Enter it below
                    to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
