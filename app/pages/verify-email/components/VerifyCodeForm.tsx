import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useFetcher, useSearchParams } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError } from "~/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import type { Route as ConfirmCodeRoute } from "../../../routes/auth/+types/confirm-verification-code";

export const VerifyCodeSchema = z.object({
    code: z.string().min(1, "Verification code is required"),
});

export default function VerifyCodeForm() {
    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(VerifyCodeSchema),
    });

    const fetcher = useFetcher<ConfirmCodeRoute.ComponentProps["actionData"]>();

    useEffect(() => {
        if (!fetcher.data) return;

        if (!fetcher.data.ok && fetcher.data.errors.fieldErrors.code) {
            setError("code", {
                type: "custom",
                message: fetcher.data.errors.fieldErrors.code[0],
            });
        }
    }, [fetcher.data]);

    const [searchParams] = useSearchParams();

    const submitOptions = {
        method: "post",
        action: "verify-code",
    } as const;

    return (
        <fetcher.Form
            className="space-y-4"
            {...submitOptions}
            onSubmit={handleSubmit((data) => {
                fetcher.submit(
                    { ...data, returnTo: searchParams.get("returnTo") ?? "" },
                    submitOptions,
                );
            })}
        >
            <Controller
                control={control}
                name="code"
                render={({ field }) => (
                    <Field data-invalid={errors.code ? true : false}>
                        <InputOTP
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                            containerClassName="justify-center"
                            {...field}
                        >
                            <InputOTPGroup>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        aria-invalid={
                                            errors.code ? true : undefined
                                        }
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        {errors.code && (
                            <FieldError
                                className="text-center"
                                errors={[errors.code]}
                            />
                        )}
                    </Field>
                )}
            />

            <Button
                className="w-full"
                isLoading={fetcher.state === "submitting"}
            >
                Verify Code
            </Button>
        </fetcher.Form>
    );
}
