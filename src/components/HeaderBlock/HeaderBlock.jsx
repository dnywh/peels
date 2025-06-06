import {
  sharedSectionTextBlockStyles,
  sharedAnchorTagStyles,
} from "@/styles/commonStyles";
import { styled } from "@pigment-css/react";

function HeaderBlock({ children }) {
  return <StyledHeaderBlock>{children}</StyledHeaderBlock>;
}

export default HeaderBlock;

const StyledHeaderBlock = styled("header")(({ theme }) => ({
  ...sharedSectionTextBlockStyles({ theme }),

  maxWidth: theme.spacing.container.maxWidth.media,
  padding: `0 calc(${theme.spacing.unit} * 1.5)`,

  "& h2": {
    fontSize: "2.25rem",
    lineHeight: "115%",
    fontWeight: "720",
    color: theme.colors.text.brand.primary,
  },

  "& p": {
    fontSize: "1.15rem",
    letterSpacing: "-0.02em",
    color: theme.colors.text.ui.quaternary,

    "& a": {
      ...sharedAnchorTagStyles({ theme }),
    },
  },

  "@media (min-width: 768px)": {
    "& h2": {
      fontSize: "2.75rem",
    },
  },
}));
