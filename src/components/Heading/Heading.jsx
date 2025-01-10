import { styled } from "@pigment-css/react";

const Heading1 = styled("h1", {
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});
const Heading2 = styled("h2", {
  fontSize: "1.75rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});
const Heading3 = styled("h3", {
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});
const Heading4 = styled("h4", {
  fontSize: "1.25rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});
const Heading5 = styled("h5", {
  fontSize: "1rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});
const Heading6 = styled("h6", {
  fontSize: "0.75rem",
  fontWeight: "bold",
  marginBottom: "1rem",
});

function Heading({ as = "h1", children, ...props }) {
  if (as === "h1") {
    return <Heading1 {...props}>{children}</Heading1>;
  }
  if (as === "h2") {
    return <Heading2 {...props}>{children}</Heading2>;
  }
  if (as === "h3") {
    return <Heading3 {...props}>{children}</Heading3>;
  }
  if (as === "h4") {
    return <Heading4 {...props}>{children}</Heading4>;
  }
  if (as === "h5") {
    return <Heading5 {...props}>{children}</Heading5>;
  }
  if (as === "h6") {
    return <Heading6 {...props}>{children}</Heading6>;
  }
}

export default Heading;
