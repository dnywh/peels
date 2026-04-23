import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

const StyledCheckboxCluster = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 1rem;
  border: 1px solid ${theme.colors.border.stark};
  border-radius: calc(${theme.corners.base} * 0.625);
  background-color: ${theme.colors.background.slight};
`;

function CheckboxCluster({ children }: PropsWithChildren) {
  return <StyledCheckboxCluster>{children}</StyledCheckboxCluster>;
}

export default CheckboxCluster;
