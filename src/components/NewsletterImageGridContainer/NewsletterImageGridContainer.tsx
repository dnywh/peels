import NewsletterImageFigcaption from "@/components/NewsletterImageFigcaption";
import { styled } from "next-yak";
import type { ReactNode } from "react";

type NewsletterImageGridContainerProps = {
  caption?: ReactNode;
  children?: ReactNode;
};

function NewsletterImageGridContainer({
  caption,
  children,
}: NewsletterImageGridContainerProps) {
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 2rem 0;
  & figcaption {
    grid-column: span 2;
  }
`;
