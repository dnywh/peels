"use client"; // For useNewsletterStatus

import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

// Replaces EmailAside for the web version of newsletter issues
// Used as an aside within a newsletter, explaining the context of the issue
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterCallout which does a similar job, albeit outside of the newsletter bounds
export default function NewsletterAside() {
  const t = useTranslations("Newsletter.aside");
  const status = useNewsletterStatus();

  return (
    <Aside>
      <h3>{t("title")}</h3>
      <p>
        {!status.isAuthenticated
          ? t.rich("bodyGuest", {
              link: (chunks) => (
                <StrongLink href="/sign-up?newsletter_preference=true">
                  {chunks}
                </StrongLink>
              ),
            })
          : status.isNewsletterSubscribed
            ? t("bodySubscribed")
            : t.rich("bodyMember", {
                link: (chunks) => (
                  <StrongLink href="/profile">{chunks}</StrongLink>
                ),
              })}
      </p>
    </Aside>
  );
}

const Aside = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  backgroundColor: theme.colors.background.sunk,
  padding: "2rem",
  margin: "2rem 0 0",
  borderRadius: theme.corners.base,

  "& h3, & p": {
    fontSize: theme.typography.size.p.md,
    "@media (min-width: 768px)": {
      fontSize: theme.typography.size.p.lg,
    },
  },

  "& h3": {
    color: theme.colors.text.ui.quinary,
    textTransform: "uppercase",
    fontWeight: 500,
    letterSpacing: "0.0875em",
    fontSize: "0.675rem",
  },
}));
