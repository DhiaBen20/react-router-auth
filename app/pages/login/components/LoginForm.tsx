import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    Link,
    useActionData,
    useNavigation,
    useSubmit,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";
import { LoginSchema } from "../schemas";
import type { Route as LoginRoute } from "../../../routes/auth/+types/login";

export default function LoginForm() {
    const {
        register,
        formState: { errors },
        handleSubmit,
        setError,
    } = useForm({
        resolver: zodResolver(LoginSchema),
    });

    const actionData = useActionData<LoginRoute.ComponentProps["actionData"]>();
    const submit = useSubmit();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (!actionData || actionData.ok) return;

        if (actionData.errors.fieldErrors.email)
            setError("email", {
                type: "custom",
                message: actionData.errors.fieldErrors.email[0],
            });

        if (actionData.errors.fieldErrors.password)
            setError("password", {
                type: "custom",
                message: actionData.errors.fieldErrors.password[0],
            });
    }, [actionData]);

    return (
        <Form
            noValidate
            method="post"
            className="space-y-4"
            onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
        >
            <Field data-invalid={errors.email ? true : false}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    {...register("email")}
                    aria-invalid={errors.email ? true : undefined}
                />
                {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            <Field data-invalid={errors.password ? true : undefined}>
                <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link to="#" className="hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <PasswordInput
                    id="password"
                    placeholder="••••••••••"
                    {...register("password")}
                    aria-invalid={errors.password ? true : undefined}
                />
                {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            <Button className="w-full" isLoading={isSubmitting}>
                Sign in
            </Button>
        </Form>
    );
}
