import RemoteImage from "@/components/RemoteImage";
import { styled } from "@pigment-css/react";

const PhotoThumbnailContainer = styled("li")(({ theme }) => ({
  flexShrink: 0,
  borderRadius: "0.375rem",
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  overflow: "hidden",
}));

const ListingPhotoRemoteImage = styled(RemoteImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // width: "100px",
  // height: "10rem",
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  cursor: "zoom-in",

  width: "calc(280px * 0.7)",
  height: "calc(210px * 0.7)",

  "@media (min-width: 768px)": {
    width: "280px",
    height: "210px",
  },
}));

function PhotoThumbnail({ fileName }) {
  return (
    <PhotoThumbnailContainer>
      <ListingPhotoRemoteImage
        bucket="listing_photos"
        filename={fileName}
        alt={`Listing photo`}
        width={280}
        height={210}
      />
    </PhotoThumbnailContainer>
  );
}

export default PhotoThumbnail;
