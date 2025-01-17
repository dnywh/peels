import { styled } from "@pigment-css/react";

const StyledSection = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",

  "&:not(:last-of-type)": {
    paddingBottom: "2rem",
    borderBottom: `1px solid ${theme.colors.border.base}`,
  },

  "& h2, & h3": {
    // color: theme.colors.text.primary,
  },
  "& h2": {
    fontSize: "1.5rem",
    fontWeight: "600",
  },
}));

function FormSection({ children }) {
  return <StyledSection>{children}</StyledSection>;
}

export default FormSection;
