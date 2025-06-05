import { sharedSectionTextBlockStyles } from "@/styles/commonStyles";
import { styled } from "@pigment-css/react";

function HeadingBlock({ children }) {
  console.log("HeadingBlock rendered", sharedSectionTextBlockStyles);
  return <StyledHeadingBlock>{children}</StyledHeadingBlock>;
}

export default HeadingBlock;

const StyledHeadingBlock = styled("div")(({ theme }) => ({
  ...sharedSectionTextBlockStyles({ theme }),

  maxWidth: "720px",
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
  },

  "@media (min-width: 768px)": {
    "& h2": {
      fontSize: "2.75rem",
    },
  },
}));
