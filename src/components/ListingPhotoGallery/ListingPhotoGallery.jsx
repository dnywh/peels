import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";

import { getListingPhotoUrl } from "@/utils/mediaUtils";

import RemoteImage from "@/components/RemoteImage";

import { styled } from "@pigment-css/react";

const ListingPhotoRemoteImage = styled(RemoteImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // width: "100px",
  // height: "10rem",
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  cursor: "zoom-in",
}));

const ListingPhotoRemoteImageEnlarged = styled(RemoteImage)(({ theme }) => ({
  borderRadius: "0.25rem",
  boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.20)",
  width: "100%",
  height: "100%",
}));

function ListingPhotoGallery({ photos }) {
  return (
    <Gallery>
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
            <ListingPhotoRemoteImage
              ref={ref}
              onClick={open}
              bucket="listing_photos"
              filename={photo}
              alt={`Listing photo ${index + 1}`}
              width={280}
              height={210}
            />

            // <img ref={ref} onClick={open} src={photo.url} alt={photo.alt} />
          )}
        </Item>
      ))}
    </Gallery>
  );
}

export default ListingPhotoGallery;
