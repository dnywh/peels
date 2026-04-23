import { theme } from "@/styles/theme.yak";
/**
 * A cosmetic styled empty slot for newsletter issues, to ensure the list is always even
 * @see NewsletterIssuesList.jsx for the primary usage
 */
import { styled } from "next-yak";
import PeelsLogo from "@/components/PeelsLogo";

export default function EmptyIssueSlot() {
  return (
    <StyledDiv>
      <PeelsLogo color="quaternary" />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  background-color: ${theme.colors.background.pit};
  border-radius: ${theme.corners.base};
  border: 1px dashed ${theme.colors.border.special};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;
