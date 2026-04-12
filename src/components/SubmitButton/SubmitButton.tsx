"use client";

import { useFormStatus } from "react-dom";
import Button, { type ButtonProps } from "@/components/Button";

export type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  pending?: boolean;
  pendingText?: string;
};

export default function SubmitButton({
  variant = "primary",
  children,
  pending = false,
  loading = false,
  pendingText = "Loading...",
  loadingText = pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isLoading = loading || pending || formPending;

  return (
    <Button
      variant={variant}
      type="submit"
      loading={isLoading}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </Button>
  );
}
