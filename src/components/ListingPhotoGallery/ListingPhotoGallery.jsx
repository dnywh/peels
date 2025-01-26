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

function ListingPhotoGallery({ photos }) {
  return (
    <Gallery>
      {photos.map((photo, index) => (
        <Item
          key={index}
          original={getListingPhotoUrl(photo, "listing_photos")}
          thumbnail={getListingPhotoUrl(photo, "listing_photos")}
          width={280}
          height={210}
        >
          {({ ref, open }) => (
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
