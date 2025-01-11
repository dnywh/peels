import Hyperlink from "@/components/Hyperlink";
import Button from "@/components/Button";
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

  "& p": {
    color: theme.colors.text.quaternity,
  },
}));

function ListingCta({ type, slug }) {
  if (type === "owner") {
    return (
      <StyledListingCta>
        <Button
          variant="secondary"
          width="full"
          href={`/profile/listings/${slug}`}
        >
          Edit listing
        </Button>
        <p>This is your own listing. Lookin’ good!</p>
      </StyledListingCta>
    );
  }
  return (
    <StyledListingCta>
      <Button
        variant="primary"
        width="full"
        href={`/sign-in?from=listing&slug=${slug}`}
      >
        Sign in to contact host
      </Button>
      <p>
        First time here? <Hyperlink href="/sign-up">Sign up</Hyperlink>
      </p>
    </StyledListingCta>
  );
}

export default ListingCta;
