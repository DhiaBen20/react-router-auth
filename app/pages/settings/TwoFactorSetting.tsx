import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "~/components/ui/item";
import type { Route as DisableTwoFactorRoute } from "../../routes/settings/+types/disable-two-factor";
import type { Route as EnableTwoFactorRoute } from "../../routes/settings/+types/enable-two-factor";

const contents = {
    enabled: {
        icon: <ShieldCheck className="size-5" />,
        title: "Enabled",
        description:
            "Your account is protected with an extra layer of security.",
    },
    disabled: {
        icon: <ShieldAlert className="size-5" />,
        title: "Not enabled",
        description: "Your account is currently protected by password only.",
    },
};

export default function TwoFactorSetting({
    enabled,
    onChange,
}: {
    enabled: boolean;
    onChange: (data: null | { secret: string; otpauth: string }) => void;
}) {
    const enableFetcher =
        useFetcher<EnableTwoFactorRoute.ComponentProps["actionData"]>();

    const disableFetcher =
        useFetcher<DisableTwoFactorRoute.ComponentProps["actionData"]>();

    useEffect(() => {
        if (enableFetcher.data && enableFetcher.data.secret) {
            onChange({
                otpauth: enableFetcher.data.otpAuth,
                secret: enableFetcher.data.secret,
            });
        }
    }, [enableFetcher]);

    useEffect(() => {
        if (disableFetcher.data && disableFetcher.data.ok) {
            onChange(null);
        }
    }, [disableFetcher]);

    const key = enabled ? "enabled" : "disabled";

    return (
        <Item variant={"outline"}>
            <ItemMedia>{contents[key].icon}</ItemMedia>
            <ItemContent>
                <ItemTitle>{contents[key].title}</ItemTitle>
                <ItemDescription>{contents[key].description}</ItemDescription>
            </ItemContent>
            <ItemActions>
                {enabled ? (
                    <disableFetcher.Form
                        method="post"
                        action="disable-two-factor"
                    >
                        <Button>Disable</Button>
                    </disableFetcher.Form>
                ) : enableFetcher.data ? (
                    <Button
                        onClick={() => {
                            onChange(null);
                        }}
                    >
                        Cancel
                    </Button>
                ) : (
                    <enableFetcher.Form
                        method="post"
                        action="enable-two-factor"
                    >
                        <Button
                            isLoading={enableFetcher.state === "submitting"}
                        >
                            Enable
                        </Button>
                    </enableFetcher.Form>
                )}
            </ItemActions>
        </Item>
    );
}
