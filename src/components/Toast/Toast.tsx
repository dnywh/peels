"use client";

import { styled } from "next-yak";
import { useSearchParams } from "next/navigation";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import SupportErrorMessage from "@/components/SupportErrorMessage";

const StyledToast = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-width: 400px;
  background-color: ${theme.colors.background.pit};
  border-radius: ${theme.corners.base};
  padding: 0.75rem 1rem;
  text-align: center;
  text-wrap: balance;
  color: ${theme.colors.text.ui.secondary};
  border: 1px solid ${theme.colors.border.base};
`;

type ToastProps = {
  variant?: "error" | "success";
  children?: ReactNode;
};

function Toast({ variant: propVariant, children: propChildren }: ToastProps) {
  const t = useTranslations("Errors");
  const searchParams = useSearchParams();

  // Handle URL-based toasts
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");
  const success = searchParams?.get("success");
  const supportReference = searchParams?.get("support_reference");
  const successMessage =
    message ||
    (success === "email_change"
      ? t("emailChangeSuccess")
      : success && success !== "true"
        ? success
        : null);

  const variant = propVariant || (error ? "error" : "success");
  const children =
    propChildren ||
    (error && supportReference ? (
      <SupportErrorMessage
        message={error}
        scope="account"
        supportReference={supportReference}
      />
    ) : (
      error || successMessage
    ));

  // Only show if we have props OR relevant URL params
  if (!children) return null;

  return (
    <StyledToast data-variant={variant}>
      <p>{children}</p>
    </StyledToast>
  );
}

export default Toast;
