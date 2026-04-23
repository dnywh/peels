import {
  sharedAnchorTagStyles,
  sharedSectionTextBlockStyles,
} from "@/styles/commonStyles";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

function HeaderBlock({ children }: PropsWithChildren) {
  return <StyledHeaderBlock>{children}</StyledHeaderBlock>;
}

export default HeaderBlock;

const StyledHeaderBlock = styled.header`
  ${sharedSectionTextBlockStyles}
  max-width: ${theme.spacing.container.maxWidth.media};
  padding: 0 calc(${theme.spacing.unit} * 1.5);

  & h2 {
    font-size: 2.25rem;
    line-height: 115%;
    font-weight: 720;
    color: ${theme.colors.text.brand.primary};
  }

  & p {
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    color: ${theme.colors.text.ui.quaternary};
  }

  & p a {
    ${sharedAnchorTagStyles}
  }

  @media (min-width: 768px) {
    & h2 {
      font-size: 2.75rem;
    }
  }
`;
