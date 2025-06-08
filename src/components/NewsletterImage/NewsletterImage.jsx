import RemoteImage from "@/components/RemoteImage";
import { styled } from "@pigment-css/react";

function NewsletterImage({ caption, ...props }) {
  return (
    <figure>
      <StyledRemoteImage {...props} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export default NewsletterImage;

export const StyledRemoteImage = styled(RemoteImage)(({ theme }) => ({
  // Match EmailImage
  backgroundColor: theme.colors.background.sunk,
  borderRadius: theme.corners.thumbnail,
  border: `1px solid ${theme.colors.border.base}`,
  objectFit: "cover",
}));
