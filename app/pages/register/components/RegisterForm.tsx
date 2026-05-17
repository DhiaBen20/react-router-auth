import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, useActionData, useNavigation, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";
import type { Route as RegisterRoute } from "../../../routes/auth/+types/register";
import z from "zod";

export const RegisterSchema = z
    .object({
        name: z.string("Name is required").min(1, "Name is required"),
        email: z.email().min(1, "Email is required"),
        password: z
            .string("Password is Required")
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long"),
        passwordConfirmation: z.string("Password confirmation is required"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        error: "Passwords don't match",
        path: ["passwordConfirmation"],
    });

type RegisterActionData = RegisterRoute.ComponentProps["actionData"];

export default function RegisterForm() {
    const actionData = useActionData<RegisterActionData>();

    const {
        register,
        formState: { errors },
        handleSubmit,
        setError,
    } = useForm({
        resolver: zodResolver(RegisterSchema),
    });

    const submit = useSubmit();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    useEffect(() => {
        if (actionData && !actionData.ok) {
            if (actionData.errors.fieldErrors.name)
                setError("name", {
                    type: "custom",
                    message: actionData.errors.fieldErrors.name[0],
                });

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

            if (actionData.errors.fieldErrors.passwordConfirmation)
                setError("passwordConfirmation", {
                    type: "custom",
                    message:
                        actionData.errors.fieldErrors.passwordConfirmation[0],
                });
        }
    }, [actionData]);

    return (
        <Form
            className="space-y-4"
            method="post"
            onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
        >
            <Field data-invalid={errors.name ? true : false}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    aria-invalid={errors.name ? true : undefined}
                    {...register("name")}
                />
                {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

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

            <Field data-invalid={errors.password ? true : false}>
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <PasswordInput
                    id="password"
                    placeholder="••••••••••"
                    {...register("password")}
                    aria-invalid={errors.password ? true : undefined}
                />
                {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            <Field data-invalid={errors.passwordConfirmation ? true : false}>
                <FieldLabel htmlFor="passwordConfirmation">
                    Confirm Password
                </FieldLabel>
                <PasswordInput
                    id="passwordConfirmation"
                    placeholder="••••••••••"
                    {...register("passwordConfirmation")}
                    aria-invalid={
                        errors.passwordConfirmation ? true : undefined
                    }
                />
                {errors.passwordConfirmation && (
                    <FieldError errors={[errors.passwordConfirmation]} />
                )}
            </Field>

            <Button className="w-full" isLoading={isSubmitting}>
                Create account
            </Button>
        </Form>
    );
}
