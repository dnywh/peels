import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { sharedSectionHeadingStyles } from "@/styles/commonStyles";
import type { PropsWithChildren } from "react";

const StyledSectionHeader = styled.header`
  & h2,
  & h3 {
    color: ${theme.colors.text.ui.primary};
  }

  & h2 {
    ${sharedSectionHeadingStyles};
  }

  & p {
    color: ${theme.colors.text.ui.secondary};
  }
`;

function FormSectionHeader({ children }: PropsWithChildren) {
  return <StyledSectionHeader>{children}</StyledSectionHeader>;
}

export default FormSectionHeader;
