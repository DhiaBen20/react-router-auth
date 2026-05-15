import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, useActionData, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import PasswordInput from "~/components/ui/password-input";
import type { Route } from "../../routes/auth/+types/reset-password";
import ResetPasswordSchema from "./schemas/ResetPasswordSchema";

export default function ResetPasswordForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(ResetPasswordSchema),
    });
    const submit = useSubmit();
    const actionData = useActionData<Route.ComponentProps["actionData"]>();

    useEffect(() => {
        if (!actionData || actionData.ok) return;

        // why do i do this?
        // i just realized its pointless
        // it only make sense if the client validation doesn't
        // and if that happens it means JS is disabled on the user's browser
        // which makes this part also pointless, i think i should just
        // render the server errors immediately
        // i will just continue doing this no-sense for now
        if (actionData.errors.fieldErrors.password) {
            setError("password", {
                type: "custom",
                message: actionData.errors.fieldErrors.password[0],
            });
        }

        if (actionData.errors.fieldErrors.passwordConfirmation) {
            setError("password", {
                type: "custom",
                message: actionData.errors.fieldErrors.passwordConfirmation[0],
            });
        }
    }, [actionData]);

    return (
        <Form
            className="space-y-4"
            method="post"
            onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
        >
            <Field data-invalid={errors.password ? true : false}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <PasswordInput
                    id="password"
                    {...register("password")}
                    aria-invalid={errors.password ? true : undefined}
                />
                {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            <Field data-invalid={errors.passwordConfirmation ? true : false}>
                <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                </FieldLabel>
                <PasswordInput
                    id="confirm-password"
                    {...register("passwordConfirmation")}
                    aria-invalid={
                        errors.passwordConfirmation ? true : undefined
                    }
                />
                {errors.passwordConfirmation && (
                    <FieldError errors={[errors.passwordConfirmation]} />
                )}
            </Field>

            <Button className="w-full">Reset password</Button>
        </Form>
    );
}
