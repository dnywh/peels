import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";

// import { getListingPhotoUrl } from "@/utils/mediaUtils";

import RemoteImage from "@/components/RemoteImage";
// import IconButton from "@/components/IconButton";

import { styled } from "@pigment-css/react";

// const GalleryCloseButton = styled(IconButton)(({ theme }) => ({
//   position: "absolute",
//   top: "0.5rem",
//   right: "0.5rem",
// }));

const PhotosList = styled("ul")(({ theme }) => ({
  display: "flex",
  gap: "0.5rem",
  overflowX: "scroll",
  padding: "0 1rem", // Pad by default, override on Photos section

  "& li": {
    flexShrink: 0,
    borderRadius: "0.25rem",
    boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
    overflow: "hidden",

    // TODO: Consolidate with PeelsFeaturedHostsPhotos / PhotoThumbnail components
    transition:
      "transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "scale(0.98)",
      opacity: 0.86,
    },
  },
}));

const ListingPhotoRemoteImageThumnail = styled(RemoteImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // width: "100px",
  // height: "10rem",
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  cursor: "zoom-in",
}));

const ListingPhotoRemoteImageEnlarged = styled(RemoteImage)(({ theme }) => ({
  borderRadius: "0.25rem",
  backgroundColor: "rgba(0, 0, 0, 0.20)",
  boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.20)",
  width: "100%",
  height: "100%",
  objectFit: "contain",
}));

const options = {
  bgOpacity: 0.82,
  padding: { top: 16, bottom: 16, left: 0, right: 0 },
  counter: false,
  // Animation
  // easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  hideAnimationDuration: 300,
  showAnimationDuration: 300,
  zoomAnimationDuration: 300,
  preloaderDelay: 0, // Should show loading spinner?
  //
  trapFocus: true, // TODO: Mobile doesn't seem to respect this
  returnFocus: false, // TODO: Mobile doesn't seem to respect this, but only on map view
  // Click actions
  bgClickAction: "close",
};

function ListingPhotoGallery({ photos }) {
  return (
    <PhotosList>
      <Gallery options={options}>
        {/* <GalleryCloseButton variant="close" /> */}
        {photos.map((photo, index) => (
          <Item
            key={index}
            // original={getListingPhotoUrl(photo, "listing_photos")}
            // thumbnail={getListingPhotoUrl(photo, "listing_photos")}
            width={1024}
            height={768}
            content={
              <ListingPhotoRemoteImageEnlarged
                bucket="listing_photos"
                filename={photo}
                alt={`Listing photo ${index + 1}`}
                width={1024}
                height={768}
              />
            }
          >
            {({ ref, open }) => (
              // Thumbnail
              <li key={index} ref={ref} onClick={open}>
                <ListingPhotoRemoteImageThumnail
                  bucket="listing_photos"
                  filename={photo}
                  alt={`Listing photo ${index + 1}`}
                  width={280}
                  height={210}
                />
              </li>
            )}
          </Item>
        ))}
      </Gallery>
    </PhotosList>
  );
}

export default ListingPhotoGallery;
