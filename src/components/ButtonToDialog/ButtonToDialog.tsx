"use client";
import { theme } from "@/styles/theme.yak";

import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/Button";
import SubmitButton from "@/components/SubmitButton";

import { styled } from "next-yak";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

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
  variant?: "primary" | "secondary" | "danger";
  size?: "massive" | "large" | "normal" | "small";
  initialButtonText: ReactNode;
  dialogTitle: ReactNode;
  children: ReactNode;
  confirmButtonText?: ReactNode;
  confirmLoadingText?: string;
  cancelButtonText?: ReactNode;
  action?: React.FormHTMLAttributes<HTMLFormElement>["action"];
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

function ButtonToDialog({
  variant = "danger",
  size,
  initialButtonText,
  dialogTitle,
  children,
  confirmButtonText,
  confirmLoadingText,
  cancelButtonText,
  action,
  onSubmit,
  // ...props // Setting this on Button (for size etc) seems to stop the dialog from opening
}: ButtonToDialogProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolvedConfirmLoadingText =
    confirmLoadingText ||
    (variant === "danger" ? t("Status.deleting") : t("Status.working"));
  const resolvedCancelButtonText = cancelButtonText || t("Actions.noCancel");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> | undefined =
    onSubmit
      ? async (event) => {
          if (isSubmitting) {
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
        <Button width="contained" variant={variant} size={size}>
          {initialButtonText}
        </Button>
      </Dialog.Trigger>
      <DialogOverlay />
      <DialogContent>
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
                pendingText={resolvedConfirmLoadingText}
                // tabIndex={undefined} // Doesn't work. See below.
                autoFocus={variant === "danger" ? false : undefined} // Doesn't work. TODO: Make it so this button isn't tabbed to by default (but can be for accessibility)
              >
                {confirmButtonText}
              </SubmitButton>
            </form>
          ) : onSubmit ? (
            <form onSubmit={handleSubmit}>
              <SubmitButton
                variant={variant !== "danger" ? "primary" : "danger"}
                width="contained"
                loading={isSubmitting}
                loadingText={resolvedConfirmLoadingText}
                // tabIndex={undefined} // Doesn't work. See below.
                autoFocus={variant === "danger" ? false : undefined} // Doesn't work. TODO: Make it so this button isn't tabbed to by default (but can be for accessibility)
              >
                {confirmButtonText}
              </SubmitButton>
            </form>
          ) : null}
          <Dialog.Close asChild>
            <Button variant="secondary" width="contained">
              {resolvedCancelButtonText}
            </Button>
          </Dialog.Close>
        </Buttons>
      </DialogContent>
    </Dialog.Root>
  );
}

export default ButtonToDialog;
