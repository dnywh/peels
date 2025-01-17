"use client";
import { useState } from "react";

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import Button from "@/components/Button";

import { styled } from "@pigment-css/react";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  position: "relative",
  zIndex: 50,
  "&:focus": {
    outline: "none",
  },
}));

const DialogWrapper = styled("div")(({ theme }) => ({
  background: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: `calc(${theme.spacing.unit} * 2)`,
}));

// className="max-w-lg space-y-4 border bg-white p-12"
const StyledDialogPanel = styled(DialogPanel)(({ theme }) => ({
  maxWidth: "40rem",
  background: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: `calc(${theme.spacing.unit} * 2)`,
}));

export default function ButtonWithDialog({
  children,
  title = "Deactivate account",
  description = "This will permanently deactivate your account",
  onConfirm,
  onCancel,
}) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete account with Headless UI
      </Button>

      <Dialog open={isOpen} as="section" onClose={() => setIsOpen(false)}>
        <DialogWrapper>
          <div
            style={{
              display: "flex",
              minHeight: "100vh",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <StyledDialogPanel>
              <DialogTitle className="font-bold">{title}</DialogTitle>
              <Description>{description}</Description>
              <div className="flex gap-4">
                <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsOpen(false)}>Deactivate</Button>
              </div>
            </StyledDialogPanel>
          </div>
        </DialogWrapper>
      </Dialog>
    </>
  );
}
