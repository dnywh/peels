"use client";

import Button from "@/components/Button";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText = "Loading...",
  ...props
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
