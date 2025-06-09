import { sharedAnchorTagStyles } from "@/styles/commonStyles";
import { styled } from "@pigment-css/react";

export default function NewsletterImageFigcaption({ margin = true, children }) {
  return <Figcaption margin={margin}>{children}</Figcaption>;
}

// Analagous to EmailCaption
const Figcaption = styled("figcaption")(({ theme }) => ({
  fontSize: theme.typography.size.p.sm,
  lineHeight: theme.typography.lineHeight.p.sm,
  textAlign: "center",
  color: theme.colors.text.tertiary,
  textWrap: "balance",

  variants: [
    {
      props: { margin: false }, // For use in NewsletterImageGridContainer
      style: {
        margin: "0.25rem 0 0", // This value + gap in NewsletterImageGridContainer should match the below value when margin is true
      },
    },
    {
      props: { margin: true }, // For use everywhere except in NewsletterImageGridContainer, where the gap acts as the margin
      style: {
        margin: "0.75rem 0 0", // Match gap in NewsletterImageGridContainer
      },
    },
  ],

  "& a": {
    ...sharedAnchorTagStyles({ theme }),
  },
}));
