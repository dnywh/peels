import { styled } from "@pigment-css/react";

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

  // maxWidth: "512px",

  backgroundColor: theme.colors.background.sunk,
  padding: "2rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
}));
