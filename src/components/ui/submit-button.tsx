"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

export interface SubmitButtonProps extends Omit<ButtonProps, "type" | "isLoading"> {
  pendingText?: string;
}

function SubmitButton({ children, pendingText = "Menyimpan...", disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} loadingText={pendingText} disabled={disabled || pending} {...props}>
      {children}
    </Button>
  );
}

export { SubmitButton };
