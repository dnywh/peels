import { styled } from "@pigment-css/react";

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  width: "100%",
  maxWidth: theme.spacing.forms.maxWidth,
}));

function Form({ children, ...props }) {
  return <StyledForm {...props}>{children}</StyledForm>;
}

export default Form;
