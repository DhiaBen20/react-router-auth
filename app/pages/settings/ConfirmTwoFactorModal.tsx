import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldError } from "~/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import type { Route } from "../../routes/settings/+types/confirm-two-factor";

export const ConfirmTwoFactorSchema = z.object({
    code: z.string().min(1, "Verification code is required"),
});

export default function ConfirmTwoFactorModal({
    onSubmitSuccess,
}: {
    onSubmitSuccess: (recoveryCode: string[]) => void;
}) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(ConfirmTwoFactorSchema) });

    const fetcher = useFetcher<Route.ComponentProps["actionData"]>();

    useEffect(() => {
        if (fetcher.data && fetcher.data.ok) {
            onSubmitSuccess(fetcher.data.recoveryCodes);
        }
    }, [fetcher, onSubmitSuccess]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="mt-4 w-full">Verify and enable</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verify authentication code</DialogTitle>
                    <DialogDescription>
                        Enter the 6-digit code from your authenticator app
                    </DialogDescription>
                </DialogHeader>

                <fetcher.Form
                    method="post"
                    action="confirm-two-factor"
                    className="space-y-4"
                    onSubmit={handleSubmit((data) =>
                        fetcher.submit(data, {
                            method: "post",
                            action: "confirm-two-factor",
                        }),
                    )}
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
                                        {Array.from({ length: 6 }).map(
                                            (_, i) => (
                                                <InputOTPSlot
                                                    key={i}
                                                    index={i}
                                                    aria-invalid={
                                                        errors.code
                                                            ? true
                                                            : undefined
                                                    }
                                                />
                                            ),
                                        )}
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
                    <div className="flex gap-4">
                        <DialogClose asChild>
                            <Button className="flex-1" variant={"outline"}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button className="flex-1">Confirm</Button>
                    </div>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
}
