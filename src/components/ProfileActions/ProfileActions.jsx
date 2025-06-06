import { signOutAction, deleteAccountAction } from "@/app/actions";
import { siteConfig } from "@/config/site";
import Button from "@/components/Button";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailLink from "@/components/EncodedEmailLink";

import { styled } from "@pigment-css/react";

const List = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: ` 0 calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5)`, // Visually match parent padding
  gap: `calc(${theme.spacing.unit} * 5)`, // Visually match other sections
}));

const ListItem = styled("li")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1.5rem",
}));

const ListItemText = styled("div")(({ theme }) => ({
  flex: 1,

  "& > h4": {
    color: theme.colors.text.ui.primary,
    fontWeight: "500", // TODO: Match the weight of the other headings, including labels
  },

  "& > p": {
    color: theme.colors.text.ui.quaternary,
    fontSize: "0.875rem",
  },
}));

export default function ProfileActions({ listings }) {
  return (
    <List>
      <ListItem>
        <ListItemText>
          <h4>Sign out</h4>
          <p>Goodbye for now!</p>
        </ListItemText>
        <Button variant="secondary" onClick={signOutAction}>
          Sign out
        </Button>
      </ListItem>

      <ListItem>
        <ListItemText>
          <h4>Export data</h4>
          <p>Get a copy of your Peels data</p>
        </ListItemText>
        <ButtonToDialog
          variant="secondary"
          initialButtonText="Export data"
          dialogTitle="Coming soon"
          cancelButtonText="Done"
        >
          We’re still working on this feature. In the meantime,{" "}
          <EncodedEmailLink address={siteConfig.email.support}>
            reach out
          </EncodedEmailLink>{" "}
          and ask us to export your data manually.
        </ButtonToDialog>
      </ListItem>

      <ListItem>
        <ListItemText>
          <h4>Delete account</h4>
          <p>
            Delete your account
            {listings?.length > 0 &&
              `, ${listings.length > 1 ? "listings" : "listing"},`}{" "}
            and all your data
          </p>
        </ListItemText>
        <ButtonToDialog
          variant="danger"
          initialButtonText="Delete account"
          dialogTitle="Delete account"
          confirmButtonText={
            listings.length > 0
              ? `Yes, delete my account and listing${listings.length > 1 ? "s" : ""}`
              : "Yes, delete my account"
          }
          action={deleteAccountAction}
        >
          Are you sure you want to delete your account?{" "}
          {listings?.length > 0 && (
            <>
              Your listing{listings.length > 1 ? "s" : ""} will also be deleted.
            </>
          )}
        </ButtonToDialog>
      </ListItem>
    </List>
  );
}
