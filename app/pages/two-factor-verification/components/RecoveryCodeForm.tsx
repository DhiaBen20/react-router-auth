import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetcher, useSearchParams } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { Route } from "../../../routes/auth/+types/verify-recovery-code";

export const RecoveryCodeSchema = z.object({
    recoveryCode: z.string().min(1, "Recovery Code is required"),
});

export default function RecoveryCodeForm() {
    const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
    const [searchParams] = useSearchParams();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(RecoveryCodeSchema),
    });

    useEffect(() => {
        if (!fetcher.data || fetcher.data.ok || !fetcher.data.errors) return;

        if (fetcher.data.errors.fieldErrors.recoveryCode) {
            setError("recoveryCode", {
                type: "custom",
                message: fetcher.data.errors.fieldErrors.recoveryCode[0],
            });
        }
    }, [fetcher.data]);

    const submitOptions = {
        method: "post",
        action: "verify-recovery-code",
    } as const;

    return (
        <fetcher.Form
            className="space-y-4"
            {...submitOptions}
            onSubmit={handleSubmit((data) => {
                fetcher.submit(
                    {
                        ...data,
                        returnTo: searchParams.get("returnTo") ?? "",
                    },
                    submitOptions,
                );
            })}
        >
            <Field data-invalid={errors.recoveryCode ? true : false}>
                <FieldLabel htmlFor="recoveryCode">Recovery Code</FieldLabel>
                <Input
                    id="recoveryCode"
                    {...register("recoveryCode")}
                    aria-invalid={errors.recoveryCode ? true : undefined}
                />
                {errors.recoveryCode && (
                    <FieldError errors={[errors.recoveryCode]} />
                )}
            </Field>

            <Button className="w-full">Continue</Button>
        </fetcher.Form>
    );
}
