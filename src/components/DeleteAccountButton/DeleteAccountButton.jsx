"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/Button";
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
  zIndex: 1, // Stop AvatarButton from showing above overlay and dialog
}));

const DialogOverlay = styled(Dialog.Overlay)({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  position: "fixed",
  inset: 0,
  zIndex: 1, // Stop AvatarButton from showing above overlay and dialog
});

function DeleteAccountButton({ listings, deleteAccountAction }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button width="contained" variant="danger">
          Delete account
        </Button>
      </Dialog.Trigger>
      <DialogOverlay />
      <DialogContent>
        <Dialog.Title>Delete account via Radix</Dialog.Title>
        <>
          Are you sure you want to delete your account?
          {listings?.length && listings.length > 0 && (
            <>
              {" "}
              Your listing{listings.length > 1 ? "s" : ""} will also be deleted:
              <ul>
                {listings.map((listing) => (
                  <li key={listing.slug}>{listing.name}</li>
                ))}
              </ul>
            </>
          )}
        </>

        <Dialog.Description>This action cannot be undone.</Dialog.Description>

        <div>
          <form action={deleteAccountAction}>
            <Button variant="danger" width="contained">
              Yes, delete my account {listings.length > 0 && `and listings`}
            </Button>
          </form>
          <Dialog.Close asChild>
            <Button variant="secondary" width="contained">
              No, cancel
            </Button>
          </Dialog.Close>
        </div>
      </DialogContent>
    </Dialog.Root>
  );
}

export default DeleteAccountButton;
