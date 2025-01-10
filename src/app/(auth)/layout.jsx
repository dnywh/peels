import { styled } from "@pigment-css/react";

const AuthPage = styled("main")(({ theme }) => ({
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",

  "@media (min-width: 768px)": {
    paddingTop: "6rem",
  },
}));

export default async function Layout({ children }) {
  return <AuthPage>{children}</AuthPage>;
}
