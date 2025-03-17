import { styled } from "@pigment-css/react";

const StyledFaqContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  // padding: `0 ${theme.spacing.unit}`,
  width: "100%",
  boxShadow: `0px 0px 0px 1px ${theme.colors.border.light}`,
}));

function FaqContainer({ children }) {
  return <StyledFaqContainer>{children}</StyledFaqContainer>;
}

export default FaqContainer;
