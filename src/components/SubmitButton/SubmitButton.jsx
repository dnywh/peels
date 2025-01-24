"use client";

import Button from "@/components/Button";

export default function SubmitButton({
  variant = "primary",
  children,
  pending = false,
  pendingText = "Loading...",
  ...props
}) {
  // TODO: Add a loading state
  // Look at Next.js server actions and mutations
  // https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  return (
    <Button variant={variant} type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
