import NewsletterImageFigcaption from "@/components/NewsletterImageFigcaption";
import { styled } from "@pigment-css/react";

function NewsletterImageGridContainer({ caption, children }) {
  return (
    <Grid>
      {children}
      {caption && (
        <NewsletterImageFigcaption margin={false}>
          {caption}
        </NewsletterImageFigcaption>
      )}
    </Grid>
  );
}

export default NewsletterImageGridContainer;

const Grid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem", // 8px
  margin: "2rem 0", // Match Figure in NewsletterImage

  "& figcaption": {
    gridColumn: "span 2",
  },
}));
