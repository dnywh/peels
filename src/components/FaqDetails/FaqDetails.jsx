import { styled } from "@pigment-css/react";

// Animate details & summary with a few lines of CSS
// https://www.youtube.com/watch?v=Vzj3jSUbMtI
const StyledFaqDetails = styled("details")(({ theme }) => ({
  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },

  overflow: "hidden",

  // Parent of all the details content
  // Turn on shadow DOM settings in Chrome dev tools to inspect this
  "&::details-content, &::-webkit-details-content": {
    color: theme.colors.text.ui.secondary,
    blockSize: "0",
    transition:
      "block-size 200ms cubic-bezier(0.4, 0, 0.2, 1), content-visibility 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    transitionBehavior: "allow-discrete",
    // padding: `0  calc(${theme.spacing.unit} * 2)`, // Does not render on Safari, done elsewhere in the interim
  },

  "&[open]::details-content": {
    blockSize: "auto",
  },

  "& > summary:after": {
    content: "'+'",
    lineHeight: "80%",
    fontSize: "2rem",
    fontWeight: "100",
    color: theme.colors.background.counter,
  },

  "&[open] > summary:after": {
    content: "'–'",
  },

  "& > p": {
    padding: `0  calc(${theme.spacing.unit} * 3)`, // Match summary padding-x. Interim solution until Safari supports targeting details-content
    // TODO: Below is overriden by shared layout from other MDX pages
    // fontSize: "1rem", // TODO: share with other 'normal' sized body copy styles, such as what's inherited on homepage FAQ
    // lineHeight: "135%", // TODO: share with other 'normal' sized body copy styles, such as what's inherited on homepage FAQ
    // color: theme.colors.text.primary, // TODO: share with other 'normal' sized body copy styles, such as what's inherited on homepage FAQ

    "& + p": {
      marginTop: "0.5rem",
    },

    "&:last-of-type": {
      paddingBlockEnd: "2rem",
    },
  },

  "& > summary": {
    cursor: "pointer",
    borderRadius: theme.corners.base,
    transition: "opacity 150ms ease-in-out",

    textBoxTrim: "both cap alphabetic", // TODO: Future CSS property to play with. See https://piccalil.li/blog/why-im-excited-about-text-box-trim-as-a-designer/

    // marginInlineStart: "1rem",
    // listStylePosition: "outside",
    // listStyleType: "none",

    // position: "relative",

    fontSize: "1.2rem",
    fontWeight: "500",
    color: theme.colors.text.ui.primary,
    padding: `calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 3)`, // Match details p padding-x

    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "2rem",

    "&::marker, &::-webkit-details-marker": {
      // flexShrink: "0",
      content: "none",
      display: "none",
      // color: theme.colors.text.ui.quaternary,
      // fontSize: "0.75em",
      // fontWeight: "100",
    },

    "&:hover": {
      opacity: 0.65,
    },
  },
}));

function FaqDetails({
  name = "faq", // Pass a custom name if multiple FaqContainers will be used on the same page, as name controls automatic closing of other same-named <details> elements
  children,
}) {
  return <StyledFaqDetails name={name}>{children}</StyledFaqDetails>;
}

export default FaqDetails;
