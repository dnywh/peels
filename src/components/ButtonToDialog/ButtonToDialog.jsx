"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/Button";
import SubmitButton from "@/components/SubmitButton";

import { styled } from "@pigment-css/react";

const DialogContent = styled(Dialog.Content)(({ theme }) => ({
  background: "white",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "450px",
  maxHeight: "85vh",
  padding: "25px",
  borderRadius: theme.corners.base,
  zIndex: 3, // Stop map controls, AvatarButton, etc from showing above overlay and dialog

  display: "flex",
  flexDirection: "column",
  gap: "1rem",
}));

const Text = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
});

const Buttons = styled("div")({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
  flexWrap: "wrap",
});

const DialogOverlay = styled(Dialog.Overlay)({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  position: "fixed",
  inset: 0,
  zIndex: 3, // Stop map controls, AvatarButton, etc from showing above overlay and dialog
});

function ButtonToDialog({
  variant = "danger",
  size = "small",
  initialButtonText,
  dialogTitle,
  children,
  confirmButtonText,
  cancelButtonText = "No, cancel",
  action,
  onSubmit,
  // ...props // Setting this on Button (for size etc) seems to stop the dialog from opening
}) {
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
          {(action || onSubmit) && (
            <form action={action} onSubmit={onSubmit}>
              <SubmitButton
                variant={variant !== "danger" ? "primary" : "danger"}
                width="contained"
                // tabIndex={undefined} // Doesn't work. See below.
                autoFocus={variant === "danger" ? false : undefined} // Doesn't work. TODO: Make it so this button isn't tabbed to by default (but can be for accessibilty)
              >
                {confirmButtonText}
              </SubmitButton>
            </form>
          )}
          <Dialog.Close asChild>
            <Button variant="secondary" width="contained">
              {cancelButtonText}
            </Button>
          </Dialog.Close>
        </Buttons>
      </DialogContent>
    </Dialog.Root>
  );
}

export default ButtonToDialog;
