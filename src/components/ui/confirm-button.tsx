"use client";

import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export interface ConfirmButtonProps extends Omit<ButtonProps, "onClick"> {
  confirmTitle?: string;
  confirmDescription?: string;
  onConfirm?: () => void | Promise<void>;
}

function ConfirmButton({
  confirmTitle = "Konfirmasi tindakan",
  confirmDescription = "Tindakan ini mungkin tidak dapat dibatalkan.",
  onConfirm,
  children,
  disabled,
  ...props
}: ConfirmButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(`${confirmTitle}\n\n${confirmDescription}`)) return;

    try {
      setIsPending(true);
      await onConfirm?.();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button type="button" disabled={disabled || isPending} isLoading={isPending} onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

export { ConfirmButton };
