import { styled } from "@pigment-css/react";

function NewsletterImageGridContainer({ caption, children }) {
  return (
    <Grid>
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </Grid>
  );
}

export default NewsletterImageGridContainer;

const Grid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem", // 8px
  // maxWidth: "512px",

  "& figcaption": {
    gridColumn: "span 2",
  },
}));
