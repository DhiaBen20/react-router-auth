import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Form,
    Link,
    useActionData,
    useNavigation,
    useSubmit,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";
import type { Route as LoginRoute } from "../../../routes/auth/+types/login";
import { LoginSchema } from "../schemas";

export default function LoginForm() {
    const {
        register,
        formState: { errors },
        handleSubmit,
        setError,
        control,
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

            <Field className="flex-row"></Field>

            <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                    <Field orientation="horizontal">
                        <Checkbox
                            id="rememberMe"
                            name={field.name}
                            onCheckedChange={field.onChange}
                        />
                        <FieldLabel
                            htmlFor="rememberMe"
                            className="text-muted-foreground"
                        >
                            Remember Me
                        </FieldLabel>
                    </Field>
                )}
            />

            <Button className="w-full" isLoading={isSubmitting}>
                Sign in
            </Button>
        </Form>
    );
}
