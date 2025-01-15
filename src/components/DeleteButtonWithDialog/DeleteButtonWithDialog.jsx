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
}));

const DialogOverlay = styled(Dialog.Overlay)({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  position: "fixed",
  inset: 0,
  zIndex: 3, // Stop map controls, AvatarButton, etc from showing above overlay and dialog
});

function DeleteButtonWithDialog({
  initialButtonText,
  dialogTitle,
  children,
  confirmButtonText,
  action,
  onSubmit,
  ...props
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button width="contained" variant="danger">
          {initialButtonText}
        </Button>
      </Dialog.Trigger>
      <DialogOverlay />
      <DialogContent>
        <Dialog.Title>{dialogTitle}</Dialog.Title>
        <Dialog.Description>{children}</Dialog.Description>

        <form action={action} onSubmit={onSubmit}>
          <SubmitButton variant="danger" width="contained">
            {confirmButtonText}
          </SubmitButton>
        </form>
        <Dialog.Close asChild>
          <Button variant="secondary" width="contained">
            No, cancel
          </Button>
        </Dialog.Close>
      </DialogContent>
    </Dialog.Root>
  );
}

export default DeleteButtonWithDialog;
