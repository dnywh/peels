import { styled } from "@pigment-css/react";

const StyledFooter = styled("footer")(({ theme }) => ({
  width: "100%",
  textAlign: "center",
  textWrap: "balance",
  maxWidth: theme.spacing.forms.maxWidth,
  color: theme.colors.text.secondary,
  paddingTop: "0",
  borderTop: "none",

  "@media (min-width: 768px)": {
    paddingTop: "2rem",
    borderTop: `1px solid ${theme.colors.border.base}`,
  },
}));

function FormFooter({ children }) {
  return <StyledFooter>{children}</StyledFooter>;
}

export default FormFooter;
