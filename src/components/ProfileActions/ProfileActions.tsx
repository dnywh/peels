"use client";

import { signOutAction, deleteAccountAction } from "@/app/actions";
import { siteConfig } from "@/config/site";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import SubmitButton from "@/components/SubmitButton";

import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

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

const ActionForm = styled("form")({
  flexShrink: 0,
});

type ProfileActionsProps = {
  listings?: unknown[];
};

export default function ProfileActions({ listings = [] }: ProfileActionsProps) {
  const t = useTranslations();

  return (
    <List>
      <ListItem>
        <ListItemText>
          <h4>{t("Profile.actions.signOutTitle")}</h4>
          <p>{t("Profile.actions.signOutDescription")}</p>
        </ListItemText>
        <ActionForm action={signOutAction}>
          <SubmitButton
            variant="secondary"
            loadingText={t("Status.signingOut")}
          >
            {t("Actions.signOut")}
          </SubmitButton>
        </ActionForm>
      </ListItem>

      <ListItem>
        <ListItemText>
          <h4>{t("Profile.actions.exportTitle")}</h4>
          <p>{t("Profile.actions.exportDescription")}</p>
        </ListItemText>
        <ButtonToDialog
          variant="secondary"
          initialButtonText={t("Actions.exportData")}
          dialogTitle={t("Profile.actions.exportDialogTitle")}
          cancelButtonText={t("Actions.done")}
        >
          {t.rich("Profile.actions.exportDialog", {
            link: (chunks) => (
              <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                {chunks}
              </EncodedEmailLink>
            ),
          })}
        </ButtonToDialog>
      </ListItem>

      <ListItem>
        <ListItemText>
          <h4>{t("Profile.actions.deleteTitle")}</h4>
          <p>
            {t("Profile.actions.deleteDescription", {
              count: listings?.length ?? 0,
            })}
          </p>
        </ListItemText>
        <ButtonToDialog
          variant="danger"
          initialButtonText={t("Profile.actions.deleteTitle")}
          dialogTitle={t("Profile.actions.deleteTitle")}
          confirmButtonText={t("Profile.actions.deleteConfirm", {
            count: listings?.length ?? 0,
          })}
          confirmLoadingText={t("Status.deleting")}
          action={deleteAccountAction}
        >
          {t("Profile.actions.deleteDialog", {
            count: listings?.length ?? 0,
          })}
        </ButtonToDialog>
      </ListItem>
    </List>
  );
}
