import { styled } from "@pigment-css/react";

const AuthPage = styled("main")(({ theme }) => ({
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",

  "@media (min-width: 768px)": {
    margin: "3rem auto",
    padding: "3rem",
    maxWidth: "32rem",

    background: theme.colors.background.top,
    border: `1px solid ${theme.colors.border.base}`,
    borderRadius: theme.corners.base,
    padding: "1.5rem 1.5rem 3rem",
  },
}));

export default async function Layout({ children }) {
  return <AuthPage>{children}</AuthPage>;
}
