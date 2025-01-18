"use client";

import Button from "@/components/Button";

export default function SubmitButton({
  children,
  pendingText = "Loading...",
  ...props
}) {
  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
