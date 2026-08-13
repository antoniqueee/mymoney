import * as React from "react";
import { ChevronDown } from "lucide-react";

import { componentStyles } from "@/config/theme";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, hasError, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={ariaInvalid ?? hasError ?? undefined}
        className={cn(
          componentStyles.control,
          "appearance-none pr-9",
          hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
