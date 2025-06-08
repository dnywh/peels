import {
  sharedSectionTextBlockStyles,
  sharedAnchorTagStyles,
} from "@/styles/commonStyles";
import { styled } from "@pigment-css/react";

function FooterBlock({ children }) {
  return <StyledFooterBlock>{children}</StyledFooterBlock>;
}

export default FooterBlock;

const StyledFooterBlock = styled("footer")(({ theme }) => ({
  ...sharedSectionTextBlockStyles({ theme }),
  "& p": {
    color: theme.colors.text.ui.quaternary,
    maxWidth: theme.spacing.container.textOpticalWidth,
  },

  "& a": {
    ...sharedAnchorTagStyles({ theme }),
  },
}));
