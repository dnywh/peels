import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  &:not(:last-of-type) {
    padding-bottom: 2rem;
    border-bottom: 1px solid ${theme.colors.border.base};
  }
  & h2,
  & h3 {
  }
  & h2 {
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

function FormSection({ children }: PropsWithChildren) {
  return <StyledSection>{children}</StyledSection>;
}

export default FormSection;
