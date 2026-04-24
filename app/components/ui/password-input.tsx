import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "~/components/ui/input-group";

export default function PasswordInput({ ...props }: ComponentProps<"input">) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput
                {...props}
                type={isVisible ? "text" : "password"}
            />
            <InputGroupAddon align={"inline-end"}>
                <InputGroupButton
                    onClick={() => setIsVisible((prevState) => !prevState)}
                >
                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}
