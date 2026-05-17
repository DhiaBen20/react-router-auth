import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError } from "~/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import type { Route as VerifyCodeRoute } from "../../../routes/auth/+types/verify-reset-code";

export const VerifyCodeSchema = z.object({
    email: z.email().min(1, "Email is required"),
    code: z.string().min(1, "Verification code is required"),
});

export default function VerifyCodeForm({ email }: { email: string }) {
    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(VerifyCodeSchema),
    });

    const fetcher = useFetcher<VerifyCodeRoute.ComponentProps["actionData"]>();

    useEffect(() => {
        if (!fetcher.data) return;

        if (!fetcher.data.ok && fetcher.data.errors.fieldErrors.code) {
            setError("code", {
                type: "custom",
                message: fetcher.data.errors.fieldErrors.code[0],
            });
        }
    }, [fetcher]);

    const submitOptions = {
        method: "post",
        action: "verify-code",
    } as const;

    return (
        <fetcher.Form
            {...submitOptions}
            onSubmit={handleSubmit((data) => {
                fetcher.submit(data, submitOptions);
            })}
            className="space-y-4"
        >
            <input type="hidden" {...register("email", { value: email })} />
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
