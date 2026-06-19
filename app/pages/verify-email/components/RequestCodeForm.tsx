import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route as SendVerificationCodeRoute } from "../../../routes/auth/+types/send-verification-code";

type FetcherData = SendVerificationCodeRoute.ComponentProps["actionData"];

export default function RequestCodeForm({
    onSubmitSucces,
}: {
    onSubmitSucces: () => void;
}) {
    const fetcher = useFetcher<FetcherData>();

    useEffect(() => {
        if (fetcher.data && fetcher.data.ok) {
            onSubmitSucces();
        }
    }, [fetcher.data]);

    return (
        <fetcher.Form method="post" action="send-code">
            <Button className="w-full">Send code</Button>
        </fetcher.Form>
    );
}
