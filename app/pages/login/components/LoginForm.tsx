import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Form,
    Link,
    useActionData,
    useNavigation,
    useSearchParams,
    useSubmit,
} from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";
import type { Route as LoginRoute } from "../../../routes/auth/+types/login";

export const LoginSchema = z.object({
    email: z.email().min(1, "Email is required"),
    password: z
        .string("Password is required")
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long"),
    rememberMe: z.transform((v) => (typeof v === "boolean" ? v : v === "true")),
});

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

    const [searchParams] = useSearchParams();

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
            onSubmit={handleSubmit((data) =>
                submit(
                    { ...data, returnTo: searchParams.get("returnTo") ?? "" },
                    { method: "post" },
                ),
            )}
        >
            <input
                type="hidden"
                name="returnTo"
                value={searchParams.get("returnTo") ?? ""}
            />

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
                    <Link to="/forgot-password" className="hover:underline">
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
