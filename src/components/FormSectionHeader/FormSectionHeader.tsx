import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledSectionHeader = styled.header`
  & h2,
  & h3 {
    color: ${theme.colors.text.ui.primary};
  }
  & h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
  & p {
    color: ${theme.colors.text.ui.secondary};
  }
`;

function FormSectionHeader({ children }: PropsWithChildren) {
  return <StyledSectionHeader>{children}</StyledSectionHeader>;
}

export default FormSectionHeader;
