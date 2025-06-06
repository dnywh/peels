import Link from "next/link";
import { styled } from "@pigment-css/react";

const getSharedStyles = ({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: "500",
  textDecoration: "underline",
  transition: "opacity 150ms ease-in-out",
  "&:hover": {
    opacity: 0.65,
  },
});

const StyledLink = styled(Link)(getSharedStyles);
const StyledPlainAnchor = styled("a")(getSharedStyles);

// An pre-styled anchor element (or button that looks like one)
export default function StrongLink({ as = Link, children, href, ...props }) {
  // For use on email addresses, where Next Link doesn't play nice
  // https://dannywhite.net/notes/next-link-email/
  if (as === "anchor") {
    return (
      <StyledPlainAnchor href={href} {...props}>
        {children}
      </StyledPlainAnchor>
    );
  }
  // Otherwise...
  return (
    <StyledLink href={href} {...props}>
      {children}
    </StyledLink>
  );
}
