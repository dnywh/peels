import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledFaqContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.background.top};
  border-radius: ${theme.corners.base};
  width: 100%;
  box-shadow: 0px 0px 0px 1px ${theme.colors.border.light};
`;

function FaqContainer({ children }: PropsWithChildren) {
  return <StyledFaqContainer>{children}</StyledFaqContainer>;
}

export default FaqContainer;
