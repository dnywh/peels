"use client";
import { theme } from "@/styles/theme.yak";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import { styled } from "next-yak";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function HeroButtons() {
  const t = useTranslations("Index.buttons");
  const { user } = useAuthUser();

  return (
    <ButtonContainer>
      <HeroActionButton href="/map" variant="primary" size="massive">
        {t("browseMap")}
      </HeroActionButton>
      {user ? (
        <SecondaryHeroActionButton
          href="/profile/listings/new"
          variant="secondary"
          size="massive"
          data-testid="hero-secondary-action"
        >
          {t("addListing")}
        </SecondaryHeroActionButton>
      ) : (
        <SecondaryHeroActionButton
          href="/sign-up"
          variant="secondary"
          size="massive"
          data-testid="hero-secondary-action"
        >
          {t("signUp")}
        </SecondaryHeroActionButton>
      )}
    </ButtonContainer>
  );
}

const HeroActionButton = styled(Button)`
  width: 100%;
  align-self: stretch;

  @media (min-width: 768px) {
    width: auto;
    align-self: center;
  }
`;

const SecondaryHeroActionButton = styled(HeroActionButton)`
  @media (min-width: 768px) {
    min-width: 13.5rem;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  width: 100%;
  max-width: ${theme.spacing.tabBar.maxWidth};
  align-items: stretch;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: calc(${theme.spacing.unit} * 2);

  @media (min-width: 768px) {
    margin-top: 2rem;
    width: fit-content;
    max-width: none;
    align-items: center;
    flex-direction: row;
  }
`;
