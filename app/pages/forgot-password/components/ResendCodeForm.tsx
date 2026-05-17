import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route as SendCodeRoute } from "../../../routes/auth/+types/send-reset-code";

const COOLDOWN = 60 * 1000;

export default function ResendCodeForm({ email }: { email: string }) {
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
