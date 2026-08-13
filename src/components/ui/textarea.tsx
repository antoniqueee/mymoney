import * as React from "react";

import { componentStyles } from "@/config/theme";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? hasError ?? undefined}
      className={cn(
        componentStyles.control,
        "min-h-24 resize-y py-2.5",
        hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
