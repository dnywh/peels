import RemoteImage from "@/components/RemoteImage";
import NewsletterImageFigcaption from "@/components/NewsletterImageFigcaption";
import { styled } from "@pigment-css/react";

function NewsletterImage({ caption, margin = true, border = true, ...props }) {
  return (
    <Figure margin={margin}>
      <ThumbnailContainer>
        <StyledRemoteImage border={border.toString()} {...props} />
      </ThumbnailContainer>
      {caption && (
        <NewsletterImageFigcaption>{caption}</NewsletterImageFigcaption>
      )}
    </Figure>
  );
}

export default NewsletterImage;

const Figure = styled("figure")(({ theme }) => ({
  variants: [
    {
      props: { margin: true },
      style: {
        margin: "2rem 0",
      },
    },
  ],
}));

const ThumbnailContainer = styled("div")(({ theme }) => ({
  // Match EmailImage and PhotoThumbnail
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  overflow: "hidden",
  borderRadius: theme.corners.thumbnail,
}));

const StyledRemoteImage = styled(RemoteImage)(({ theme }) => ({
  width: "100%",
  objectFit: "cover",
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // Match EmailImage
  backgroundColor: theme.colors.background.sunk,
  borderRadius: theme.corners.thumbnail,

  variants: [
    {
      // Turning a boolean into string helps with Pigment CSS transient prop issue.
      // This issue occurs becaues the prop is otherwise passed on to the next component (RemoteImage in this case)
      // See:https://github.com/mui/material-ui/issues/25925
      props: { border: "true" }, // For use everywhere except in NewsletterIssueTile
      style: {
        border: `1px solid ${theme.colors.border.base}`,
      },
    },
  ],
}));
