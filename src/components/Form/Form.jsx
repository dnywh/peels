import { styled } from "@pigment-css/react";

const getSharedStyles = ({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  maxWidth: theme.spacing.forms.maxWidth,

  background: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: "1.5rem",

  "@media (min-width: 768px)": {
    background: "inherit",
    border: "none",
    borderRadius: "inherit",
    padding: "0",
  },
});

const StyledForm = styled("form")(getSharedStyles);
const StyledContainer = styled("section")(getSharedStyles, {
  "& p": {
    textAlign: "center",
    textWrap: "balance",
  },
});

function Form({ as = "form", children, ...props }) {
  if (as === "container") {
    return <StyledContainer {...props}>{children}</StyledContainer>;
  }

  return <StyledForm {...props}>{children}</StyledForm>;
}

export default Form;
