import { styled } from "@pigment-css/react";

const AuthPage = styled("main")(({ theme }) => ({
  margin: "0.5rem auto", // Match other layouts like centered page
  padding: "0.5rem", // Match other layouts like centered page

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",

  width: "100%",
  maxWidth: theme.spacing.forms.maxWidth,

  "@media (min-width: 768px)": {
    margin: "3rem auto", // Match other layouts like centered page
    padding: "1.5rem", // Match other layouts like centered page

    background: theme.colors.background.top,
    border: `1px solid ${theme.colors.border.base}`,
    borderRadius: theme.corners.base,
    // padding: "1.5rem 1.5rem 3rem",
  },
}));

export default async function Layout({ children }) {
  return <AuthPage>{children}</AuthPage>;
}
