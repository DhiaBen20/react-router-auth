import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, FieldError } from "~/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import type { Route as SendCodeRoute } from "../../../routes/auth/+types/send-reset-code";
import type { Route as VerifyCodeRoute } from "../../../routes/auth/+types/verify-reset-code";
import { VerifyResetCodeSchema } from "../schemas/VerifyResetCodeSchema";

export default function ResetCodeVerificationForm({
    email,
}: {
    email: string;
}) {
    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(VerifyResetCodeSchema),
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
        <div>
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

                <Field></Field>

                <Button
                    className="w-full"
                    isLoading={fetcher.state === "submitting"}
                >
                    Verify Code
                </Button>
            </fetcher.Form>

            <ResendCode email={email} />
        </div>
    );
}

const COOLDOWN = 60 * 1000;

function ResendCode({ email }: { email: string }) {
    const fetcher = useFetcher<SendCodeRoute.ComponentProps["actionData"]>();
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (fetcher.data && fetcher.data.ok && fetcher.state !== "submitting") {
            timerRef.current = setInterval(() => setTime((t) => t + 500), 500);
            setIsTimerRunning(true);
            return () => {
                return clearInterval(timerRef.current!);
            };
        }
    }, [fetcher]);

    useEffect(() => {
        if (time >= COOLDOWN) {
            setTime(0);
            setIsTimerRunning(false);
            clearTimeout(timerRef.current!);
        }
    }, [time]);

    return (
        <fetcher.Form method="post" action="send-code">
            <input type="hidden" name="email" value={email} />

            <p className="mt-4 text-center">
                Didn't receive it?
                <Button
                    variant={"link"}
                    isLoading={fetcher.state === "submitting"}
                    disabled={fetcher.state === "submitting" || isTimerRunning}
                >
                    {isTimerRunning
                        ? `resend in ${Math.trunc((COOLDOWN - time) / 1000)}s`
                        : "resend code"}
                </Button>
            </p>
        </fetcher.Form>
    );
}
