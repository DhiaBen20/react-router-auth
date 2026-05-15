import type { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export default function ForgotPasswordCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>
                    Enter your email and we'll send you a code to reset your
                    password.
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
