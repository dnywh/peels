import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledFooter = styled.footer`
  width: 100%;
  text-align: center;
  text-wrap: balance;
  color: ${theme.colors.text.secondary};
  padding-top: 0;
  border-top: none;
  @media (min-width: 768px) {
    padding-top: 2rem;
    border-top: 1px solid ${theme.colors.border.base};
  }
`;

function FormFooter({ children }: PropsWithChildren) {
  return <StyledFooter>{children}</StyledFooter>;
}

export default FormFooter;
