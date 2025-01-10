import { styled } from "@pigment-css/react";

const Main = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxWidth: "720px",
  margin: "4rem auto 0",
  backgroundColor: theme.colors.background.top,
  padding: "2rem 2rem 3.5rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
  marginBottom: "3rem",

  "@media (min-width: 768px)": {
    margin: "4rem auto 3rem",
  },

  h1: {
    fontSize: "3rem",
    color: theme.colors.text.primary,
  },
  p: {
    color: theme.colors.text.secondary,
    fontSize: "1.2rem",
  },
}));

export default async function Layout({ children }) {
  return <Main>{children}</Main>;
}
