import Link from "next/link";
import RemoteImage from "@/components/RemoteImage";
import { styled } from "@pigment-css/react";

const PhotoThumbnailContainer = styled(Link)(({ theme }) => ({
  display: "block",
  width: "280px",
  height: "210px",

  flexShrink: 0,
  borderRadius: "0.375rem",
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  overflow: "hidden",

  "&::after": {
    borderRadius: "0.375rem",

    content: "'This is a test'",
    fontSize: "1rem",
    color: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    padding: "0.5rem",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    opacity: 0,
  },

  transition: "background-color 1s ease-in-out",

  "&:hover": {
    // boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
    "&::after": {
      opacity: 1,
    },
  },
}));

const ListingPhotoRemoteImage = styled(RemoteImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // width: "100px",
  // height: "10rem",
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  // cursor: "zoom-in",

  // width: "calc(280px * 0.7)",
  // height: "calc(210px * 0.7)",

  "@media (min-width: 768px)": {
    // width: "280px",
    // height: "auto",
  },
}));

function PhotoThumbnail({ fileName, listingId }) {
  return (
    <li>
      <PhotoThumbnailContainer href={`/map?listing=${listingId}`}>
        <ListingPhotoRemoteImage
          bucket="listing_photos"
          filename={fileName}
          alt={`Listing photo`}
          width={280}
          height={210}
        />
      </PhotoThumbnailContainer>
    </li>
  );
}

export default PhotoThumbnail;
