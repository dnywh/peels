"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@radix-ui/react-dialog";

import Button from "@/components/Button";

function DeleteAccountButton({ listings, deleteAccountAction }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Delete account via Radix</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete account via Radix</DialogTitle>
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

        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4 flex gap-4">
          <form action={deleteAccountAction}>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Yes, delete my account {listings.length > 0 && `and listings`}
            </button>
          </form>
          <DialogClose asChild>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded">
              No, cancel
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccountButton;
