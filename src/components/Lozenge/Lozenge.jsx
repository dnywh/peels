import { styled } from "@pigment-css/react";

const StyledLozenge = styled("span")(({ theme }) => ({
  background: theme.colors.background.slight,
  textTransform: "uppercase",
  fontWeight: 700,
  letterSpacing: "0.05rem",
  fontSize: "0.675rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.5rem",
  width: "fit-content",
  color: theme.colors.text.ui.tertiary,
  boxShadow: `0px 0px 0px 1px ${theme.colors.border.base}`,
}));

function Lozenge({ children }) {
  return <StyledLozenge>{children}</StyledLozenge>;
}

export default Lozenge;
