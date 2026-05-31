import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import PasswordInput from "~/components/ui/password-input";
import type { Route as UpdatePasswordRoute } from "../../routes/settings/+types/update-password";

export const UpdatePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(1, "New password is required")
            .min(8, "New password must be at least 8 characters long"),
        confirmPassword: z.string("Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        error: "Passwords don't match",
        path: ["confirmPassword"],
    });

export default function UpdatePasswordForm() {
    const fetcher =
        useFetcher<UpdatePasswordRoute.ComponentProps["actionData"]>();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
    } = useForm({
        resolver: zodResolver(UpdatePasswordSchema),
    });

    useEffect(() => {
        if (!fetcher.data) return;

        if (fetcher.data.ok) {
            reset();
        }

        const errors = fetcher.data.errors;

        if (errors && errors.fieldErrors.currentPassword) {
            setError("currentPassword", {
                type: "custom",
                message: errors.fieldErrors.currentPassword[0],
            });
        }
        if (errors && errors.fieldErrors.newPassword) {
            setError("newPassword", {
                type: "custom",
                message: errors.fieldErrors.newPassword[0],
            });
        }
        if (errors && errors.fieldErrors.confirmPassword) {
            setError("confirmPassword", {
                type: "custom",
                message: errors.fieldErrors.confirmPassword[0],
            });
        }
    }, [fetcher.data]);

    return (
        <fetcher.Form
            method="post"
            action="update-password"
            className="space-y-4"
            onSubmit={handleSubmit((data) =>
                fetcher.submit(data, {
                    method: "post",
                    action: "update-password",
                }),
            )}
        >
            <Field data-invalid={errors.currentPassword ? true : false}>
                <FieldLabel htmlFor="currentPassword">
                    Current password
                </FieldLabel>
                <PasswordInput
                    id="currentPassword"
                    {...register("currentPassword")}
                    aria-invalid={errors.currentPassword ? true : undefined}
                />
                {errors.currentPassword && (
                    <FieldError errors={[errors.currentPassword]} />
                )}
            </Field>

            <Field data-invalid={errors.newPassword ? true : false}>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <PasswordInput
                    id="newPassword"
                    {...register("newPassword")}
                    aria-invalid={errors.newPassword ? true : undefined}
                />
                {errors.newPassword && (
                    <FieldError errors={[errors.newPassword]} />
                )}
            </Field>

            <Field data-invalid={errors.confirmPassword ? true : false}>
                <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                </FieldLabel>
                <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? true : undefined}
                />
                {errors.confirmPassword && (
                    <FieldError errors={[errors.confirmPassword]} />
                )}
            </Field>
            <Button isLoading={fetcher.state === "submitting"}>
                Save Password
            </Button>
        </fetcher.Form>
    );
}
