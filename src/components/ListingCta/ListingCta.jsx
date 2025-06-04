import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import Button from "@/components/Button";
import PeelsLogo from "@/components/PeelsLogo";
import { styled } from "@pigment-css/react";

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
  if (viewer === "owner") {
    return (
      <StyledListingCta>
        <Button
          variant="secondary"
          width="full"
          href={`/profile/listings/${slug}`}
        >
          Edit listing
        </Button>
        <p>
          This is your own listing{isStub && ", marked as a stub"}.{" "}
          {visibility
            ? "Lookin’ good!"
            : "You’ve hidden it from the map, so only you can see this right now."}
        </p>
      </StyledListingCta>
    );
  }
  if (isStub) {
    return (
      <StyledListingCta>
        <PeelsLogo color="quaternary" />
        <Text>
          <p>
            This is a stub created by the Peels team. Double-check the listing
            information before visiting.
          </p>
          <p>
            Are you the owner?{" "}
            <EncodedEmailHyperlink address={siteConfig.email.support}>
              Reach out
            </EncodedEmailHyperlink>{" "}
            to claim this listing or to request changes.
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
        Sign in to contact
      </Button>
      <p>
        First time here? <Hyperlink href="/sign-up">Sign up</Hyperlink>
      </p>
    </StyledListingCta>
  );
}

export default ListingCta;
