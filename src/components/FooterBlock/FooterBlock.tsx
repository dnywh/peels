import { sharedSectionTextBlockStyles } from "@/styles/commonStyles";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

function FooterBlock({ children }: PropsWithChildren) {
  return <StyledFooterBlock>{children}</StyledFooterBlock>;
}

export default FooterBlock;

const StyledFooterBlock = styled.footer`
  ${sharedSectionTextBlockStyles};

  & p {
    color: ${theme.colors.text.ui.quaternary};
    max-width: ${theme.spacing.container.textOpticalWidth};
  }

  & a {
    color: inherit;
    transition: ${theme.transitions.textColor};
  }

  & a:visited {
    color: inherit;
  }

  & a:hover {
    color: ${theme.colors.text.primary};
  }
`;
