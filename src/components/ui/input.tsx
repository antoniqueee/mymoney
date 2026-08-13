import * as React from "react";

import { componentStyles } from "@/config/theme";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={ariaInvalid ?? hasError ?? undefined}
      className={cn(
        componentStyles.control,
        "file:mr-3 file:text-foreground",
        hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
