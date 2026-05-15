import type { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export default function ResetPasswordCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Set a new password</CardTitle>
                <CardDescription>
                    Choose a new password to secure your account.
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
