import { styled } from "@pigment-css/react";

// Used as an aside within a newsletter, such as explaining the context of the issue
// Analagous to EmailAside
function NewsletterAside({ title, children }) {
  return (
    <Aside>
      <h3>{title}</h3>
      {children}
    </Aside>
  );
}

export default NewsletterAside;

const Aside = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.colors.background.sunk,
  padding: "2rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
}));
