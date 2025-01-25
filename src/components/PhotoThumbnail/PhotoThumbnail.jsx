import Link from "next/link";
import RemoteImage from "@/components/RemoteImage";
import { styled } from "@pigment-css/react";

const PHOTO_THUMBNAIL_WIDTH = 360;
const PHOTO_THUMBNAIL_HEIGHT = 240;

const PhotoThumbnailContainer = styled(Link)(({ theme }) => ({
  display: "block",
  position: "relative",
  flexShrink: 0,
  borderRadius: "0.375rem",
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  overflow: "hidden",

  width: `calc(${PHOTO_THUMBNAIL_WIDTH}px * 0.65)`,
  height: `calc(${PHOTO_THUMBNAIL_HEIGHT}px * 0.65)`,

  "@media (min-width: 768px)": {
    width: `${PHOTO_THUMBNAIL_WIDTH}px`,
    height: `${PHOTO_THUMBNAIL_HEIGHT}px`,
  },
}));

const ListingPhotoRemoteImage = styled(RemoteImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  // cursor: "zoom-in",
}));

const Caption = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100%",
  padding: "0.825rem 0.5rem",
  background:
    "linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), rgba(0,0,0,0.05)",
  color: "white",
  opacity: 0,
  transition: "opacity 0.2s ease-in-out",

  display: "flex",
  alignItems: "flex-end",

  [`${PhotoThumbnailContainer}:hover &`]: {
    opacity: 1,
  },

  "& > p": {
    textAlign: "left",
    textShadow: "0 0 0.25rem rgba(0, 0, 0, 0.5)",
    fontSize: "0.875rem",
    fontWeight: "600",
    lineHeight: "115%",
  },
}));

function PhotoThumbnail({ fileName, listingId, caption }) {
  return (
    <li>
      <PhotoThumbnailContainer href={`/map?listing=${listingId}`}>
        <ListingPhotoRemoteImage
          bucket="listing_photos"
          filename={fileName}
          alt={`Listing photo`}
          width={PHOTO_THUMBNAIL_WIDTH}
          height={PHOTO_THUMBNAIL_HEIGHT}
        />
        <Caption>
          <p>{caption}</p>
        </Caption>
      </PhotoThumbnailContainer>
    </li>
  );
}

export default PhotoThumbnail;
