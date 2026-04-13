import { siteConfig } from "@/config/site";
import StrongLink from "@/components/StrongLink";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import Button from "@/components/Button";
import PeelsLogo from "@/components/PeelsLogo";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

const StyledListingCta = styled("aside")(({ theme }) => ({
  backgroundColor: theme.colors.background.slight,
  border: `1px solid ${theme.colors.border.light}`,
  borderRadius: theme.corners.base,
  padding: "1.5rem",
  display: "flex",
  gap: "0.75rem",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",

  "& p": {
    color: theme.colors.text.ui.tertiary,
    textWrap: "balance",
  },
}));

const Text = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",

  "& p": {
    fontSize: "0.875rem",
  },
}));

function ListingCta({ viewer, slug, visibility = true, isStub = false }) {
  const t = useTranslations();

  if (viewer === "owner") {
    return (
      <StyledListingCta>
        <Button
          variant="secondary"
          width="full"
          href={`/profile/listings/${slug}`}
        >
          {t("Listings.edit.title")}
        </Button>
        <p>
          {t("Listings.read.ownerNote", {
            stub: isStub ? "true" : "false",
            visibility: visibility ? "true" : "false",
          })}
        </p>
      </StyledListingCta>
    );
  }
  if (isStub) {
    return (
      <StyledListingCta>
        <PeelsLogo color="quaternary" />
        <Text>
          <p>{t("Listings.read.stubNote")}</p>
          <p>
            {t.rich("Listings.read.stubClaim", {
              link: (chunks) => (
                <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                  {chunks}
                </EncodedEmailLink>
              ),
            })}
          </p>
        </Text>
      </StyledListingCta>
    );
  }

  return (
    <StyledListingCta>
      <Button
        variant="primary"
        width="full"
        href={`/sign-in?redirect_to=/listings/${slug}`}
      >
        {t("Actions.signInToContact")}
      </Button>
      <p>
        {t.rich("Listings.read.firstTime", {
          link: (chunks) => <StrongLink href="/sign-up">{chunks}</StrongLink>,
        })}
      </p>
    </StyledListingCta>
  );
}

export default ListingCta;
