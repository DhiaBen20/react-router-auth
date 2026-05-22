import { Copy } from "lucide-react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "~/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "~/components/ui/input-group";

export default function ManualKeySetup({ secret }: { secret: string }) {
    const [showSecret, setShowSecret] = useState(false);

    function handleButtonClick() {
        flushSync(() => {
            setShowSecret(true);
        });
        // const manual =
        //     document.getElementById(
        //         "manual-key",
        //     )!;

        // manual.scrollIntoView();
    }

    return (
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
            <Button variant={"ghost"} onClick={handleButtonClick}>
                Enter the key manually
            </Button>

            {showSecret && (
                <InputGroup className="max-w-xs">
                    <InputGroupInput id="manual-key" readOnly value={secret} />
                    <InputGroupAddon align={"inline-end"}>
                        <InputGroupButton>
                            <Copy />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            )}
        </div>
    );
}
