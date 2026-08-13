import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { componentStyles } from "@/config/theme";
import { cn } from "@/lib/utils";

const badgeVariants = cva(componentStyles.badge.base, {
  variants: { variant: componentStyles.badge.variants },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
