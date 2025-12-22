/**
 * A cosmetic styled empty slot for newsletter issues, to ensure the list is always even
 * @see NewsletterIssuesList.jsx for the primary usage
 */
import { styled } from "@pigment-css/react";
import PeelsLogo from "@/components/PeelsLogo";

export default function EmptyIssueSlot() {
  return (
    <StyledDiv>
      <PeelsLogo color="quaternary" />
    </StyledDiv>
  );
}

const StyledDiv = styled("div")(({ theme }) => ({
  backgroundColor: theme.colors.background.pit,
  borderRadius: theme.corners.base,
  border: `1px dashed ${theme.colors.border.special}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
}));
