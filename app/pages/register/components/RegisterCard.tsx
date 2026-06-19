import type { ReactNode } from "react";
import { Link } from "react-router";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { GoogleSignInForm } from "~/pages/login/components/GoogleSignInForm";

export default function RegisterCard({ children }: { children: ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-1.5 text-2xl">
                    Create an account
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
                <p className="mt-4 text-center">
                    <span className="text-muted-foreground">
                        Already have an account?&nbsp;
                    </span>
                    <Link to={"/login"}>Sign in</Link>
                </p>
            </CardContent>
            <CardFooter className="flex-col">
                <GoogleSignInForm />
            </CardFooter>
        </Card>
    );
}
