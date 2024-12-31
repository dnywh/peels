import { styled } from "@pigment-css/react";

const AuthPage = styled("main")({
  // TODO: How do I reach out and set the body colour here conditionally
  backgroundColor: "#F8F6F3",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",
});

export default async function Layout({ children }) {
  return (
    <>
      <AuthPage>{children}</AuthPage>
    </>
  );
}
