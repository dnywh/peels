import { styled } from "@pigment-css/react";

const StyledSectionHeader = styled("header")(({ theme }) => ({
  // display: "flex",
  // flexDirection: "column",

  "& h2, & h3": {
    color: theme.colors.text.ui.primary,
  },
  "& h2": {
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  "& p": {
    color: theme.colors.text.ui.secondary,
  },
}));

function FormSectionHeader({ children }) {
  return <StyledSectionHeader>{children}</StyledSectionHeader>;
}

export default FormSectionHeader;
