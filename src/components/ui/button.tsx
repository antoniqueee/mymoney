import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { componentStyles } from "@/config/theme";
import { cn } from "@/lib/utils";

const buttonVariants = cva(componentStyles.button.base, {
  variants: {
    variant: componentStyles.button.variants,
    size: componentStyles.button.sizes,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      isLoading = false,
      loadingText,
      className,
      variant,
      size,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-disabled={disabled || isLoading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
