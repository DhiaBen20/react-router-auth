import type { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";

export default function VerifyEmailCard({ children }: { children: ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Email verification required</CardTitle>
                <CardDescription>
                    We'll send a one-time code to your email. You'll only need
                    to do this once.
                </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
