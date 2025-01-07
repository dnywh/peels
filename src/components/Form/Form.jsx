import { styled } from "@pigment-css/react";

const StyledForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  // width: "100%",
  // maxWidth: "40rem",
});

function Form({ children, ...props }) {
  return <StyledForm {...props}>{children}</StyledForm>;
}

export default Form;
