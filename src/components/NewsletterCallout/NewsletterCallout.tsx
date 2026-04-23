"use client";

import { theme } from "@/styles/theme.yak";
import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import Button from "@/components/Button";
import PostageStamp from "@/components/PostageStamp";
import { styled } from "next-yak";
import { useTranslations } from "next-intl";

function UnauthenticatedCallout() {
  const t = useTranslations();

  return (
    <Callout>
      <PostageStamp />
      <Text>
        <h3>{t("Newsletter.callout.guestTitle")}</h3>
        <p>{t("Newsletter.callout.guestBody")}</p>
      </Text>
      <ButtonContainer>
        <Button variant="primary" href="/sign-up?newsletter_preference=true">
          {t("Actions.joinPeels")}
        </Button>
        <Button variant="secondary" href="/sign-in">
          {t("Actions.signIn")}
        </Button>
      </ButtonContainer>
    </Callout>
  );
}

// Advertising the newsletter (sits outside of the newsletter bounds)
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterAside which does a similar job, albeit inside the newsletter bounds
export default function NewsletterCallout() {
  const t = useTranslations();
  const status = useNewsletterStatus();

  if (status.isLoading || status.error || !status.isAuthenticated) {
    return <UnauthenticatedCallout />;
  }

  return (
    <Callout>
      <PostageStamp />
      <Text>
        <h3>
          {status.isNewsletterSubscribed
            ? t("Newsletter.callout.alreadySubscribedTitle")
            : t("Newsletter.callout.notSubscribedTitle")}
        </h3>
        <p>
          {status.isNewsletterSubscribed
            ? t("Newsletter.callout.alreadySubscribedBody")
            : t("Newsletter.callout.notSubscribedBody")}
        </p>
      </Text>
      <Button
        variant={status.isNewsletterSubscribed ? "secondary" : "primary"}
        href="/profile"
      >
        {t("Newsletter.callout.editPreference")}
      </Button>
    </Callout>
  );
}

const Callout = styled.div`
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.aside};
  container-type: inline-size;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border-radius: ${theme.corners.base};
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  overflow: hidden;
  position: relative;
`;

const Text = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  & > * {
    text-wrap: balance;
  }
  & > h3 {
    color: ${theme.colors.text.ui.secondary};
    font-weight: 500;
    font-size: 1.5rem;
    line-height: ${theme.typography.lineHeight.h};
    margin-top: 2.5rem;
    margin-right: 7.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: calc(${theme.spacing.unit} * 2);
`;
