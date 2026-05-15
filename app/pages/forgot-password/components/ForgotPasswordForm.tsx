import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { Route } from "../../../routes/auth/+types/send-reset-code";
import { SendResetCodeSchema } from "../schemas/SendResetCodeSchema";

export default function ForgotPasswordForm({
    onSubmitSuccess,
}: {
    onSubmitSuccess: (email: string) => void;
}) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        getValues,
    } = useForm({
        resolver: zodResolver(SendResetCodeSchema),
    });

    const fetcher = useFetcher<Route.ComponentProps["actionData"]>();

    useEffect(() => {
        if (!fetcher.data) return;

        if (!fetcher.data.ok && fetcher.data.errors.fieldErrors.email) {
            setError("email", {
                type: "custom",
                message: fetcher.data.errors.fieldErrors.email[0],
            });
        } else {
            onSubmitSuccess(getValues("email"));
        }
    }, [fetcher]);

    const submitOptions = {
        method: "post",
        action: "send-code",
    } as const;

    return (
        <fetcher.Form
            className="space-y-4"
            {...submitOptions}
            onSubmit={handleSubmit((data) => {
                fetcher.submit(data, submitOptions);
            })}
        >
            <Field data-invalid={errors.email ? true : false}>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                    // type="email"
                    id="email"
                    aria-invalid={errors.email ? true : undefined}
                    {...register("email")}
                />
                {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            <Button
                className="w-full"
                isLoading={fetcher.state === "submitting"}
            >
                Send code
            </Button>
        </fetcher.Form>
    );
}
