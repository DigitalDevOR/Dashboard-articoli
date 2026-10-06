import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";

type PasswordInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue"
>;

export function PasswordInput({
    autoComplete = "off",
    className,
    ...props
}: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                autoComplete={autoComplete}
                className={cn("pr-10", className)}
                defaultValue=""
                type={isVisible ? "text" : "password"}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 inline-flex h-10 w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={isVisible ? "Nascondi password" : "Mostra password"}
                aria-pressed={isVisible}
                onClick={() => setIsVisible((visible) => !visible)}
            >
                {isVisible ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
