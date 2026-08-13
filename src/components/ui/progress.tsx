import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
  label?: string;
  tone?: "safe" | "warning" | "exceeded";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, label = "Progres", tone = "safe", ...props }, ref) => {
    const normalizedValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(normalizedValue)}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-transform duration-300", tone === "safe" && "bg-income", tone === "warning" && "bg-warning", tone === "exceeded" && "bg-expense", indicatorClassName)}
          style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
