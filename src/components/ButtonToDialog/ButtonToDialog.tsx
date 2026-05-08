"use client";
import { theme } from "@/styles/theme.yak";

import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/Button";
import SubmitButton from "@/components/SubmitButton";

import { styled } from "next-yak";
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import type { FormSubmitHandler } from "@/types/events";
import type { ButtonVariant } from "@/components/Button";

const DialogContent = styled(Dialog.Content)`
  background: ${theme.colors.background.top};
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.base};
  box-shadow: 0 0 0 1px ${theme.colors.border.light};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px;
  max-height: 85vh;
  padding: 25px;
  border-radius: ${theme.corners.base};
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  & h2 {
    color: ${theme.colors.text.primary};
    line-height: 115%;
  }

  & p {
    color: ${theme.colors.text.secondary};
    line-height: 145%;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 3;
`;

type ButtonToDialogProps = {
  variant?: ButtonVariant;
  triggerVariant?: ButtonVariant;
  size?: "massive" | "large" | "normal" | "small";
  initialButtonText: ReactNode;
  dialogTitle: ReactNode;
  children: ReactNode;
  confirmButtonText?: ReactNode;
  confirmLoadingText?: string;
  cancelButtonText?: ReactNode;
  action?: FormHTMLAttributes<HTMLFormElement>["action"];
  disabled?: boolean;
  onSubmit?: FormSubmitHandler;
  pending?: boolean;
};

function ButtonToDialog({
  variant = "danger",
  triggerVariant,
  size,
  initialButtonText,
  dialogTitle,
  children,
  confirmButtonText,
  confirmLoadingText,
  cancelButtonText,
  action,
  disabled = false,
  onSubmit,
  pending = false,
  // ...props // Setting this on Button (for size etc) seems to stop the dialog from opening
}: ButtonToDialogProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const resolvedConfirmLoadingText =
    confirmLoadingText ||
    (variant === "danger" ? t("Status.deleting") : t("Status.working"));
  const resolvedCancelButtonText = cancelButtonText || t("Actions.noCancel");
  const isPending = pending || isSubmitting;
  const handleOpenAutoFocus: ComponentPropsWithoutRef<
    typeof Dialog.Content
  >["onOpenAutoFocus"] = (event) => {
    if (variant !== "danger") {
      return;
    }

    event.preventDefault();
    requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });
  };

  const handleSubmit: FormSubmitHandler | undefined = onSubmit
    ? async (event) => {
        if (isPending) {
          event.preventDefault();
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(event);
        } finally {
          setIsSubmitting(false);
        }
      }
    : undefined;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          width="contained"
          variant={triggerVariant ?? variant}
          size={size}
          disabled={disabled || isPending}
        >
          {initialButtonText}
        </Button>
      </Dialog.Trigger>
      <DialogOverlay />
      <DialogContent onOpenAutoFocus={handleOpenAutoFocus}>
        <Text>
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Description>{children}</Dialog.Description>
        </Text>
        <Buttons>
          {action ? (
            <form action={action}>
              <SubmitButton
                variant={variant !== "danger" ? "primary" : "danger"}
                width="contained"
                disabled={disabled || isPending}
                pending={isPending}
                pendingText={resolvedConfirmLoadingText}
                data-testid="dialog-confirm-button"
              >
                {confirmButtonText}
              </SubmitButton>
            </form>
          ) : onSubmit ? (
            <form onSubmit={handleSubmit}>
              <SubmitButton
                variant={variant !== "danger" ? "primary" : "danger"}
                width="contained"
                disabled={disabled || isPending}
                loading={isPending}
                loadingText={resolvedConfirmLoadingText}
                data-testid="dialog-confirm-button"
              >
                {confirmButtonText}
              </SubmitButton>
            </form>
          ) : null}
          <Dialog.Close asChild>
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              width="contained"
              disabled={isPending}
              data-testid="dialog-cancel-button"
            >
              {resolvedCancelButtonText}
            </Button>
          </Dialog.Close>
        </Buttons>
      </DialogContent>
    </Dialog.Root>
  );
}

export default ButtonToDialog;
