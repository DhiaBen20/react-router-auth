import type { ReactNode } from "react";
import { Link } from "react-router";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { GoogleSignInForm } from "./GoogleSignInForm";

export default function LoginCard({ children }: { children: ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-1.5 text-2xl">Sign in</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
                <p className="mt-4 text-center">
                    <span className="text-muted-foreground">
                        New on our platform?&nbsp;
                    </span>
                    <Link to={"/register"}>Create an account</Link>
                </p>
            </CardContent>
            <CardFooter className="flex-col">
                <GoogleSignInForm />
            </CardFooter>
        </Card>
    );
}
