import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledLozenge = styled.span`
  background: ${theme.colors.background.slight};
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05rem;
  font-size: 0.675rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  width: fit-content;
  color: ${theme.colors.text.ui.tertiary};
  box-shadow: 0px 0px 0px 1px ${theme.colors.border.base};
`;

function Lozenge({ children }: PropsWithChildren) {
  return <StyledLozenge>{children}</StyledLozenge>;
}

export default Lozenge;
