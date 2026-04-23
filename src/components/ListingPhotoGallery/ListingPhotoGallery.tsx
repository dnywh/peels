import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";

// import { getListingPhotoUrl } from "@/utils/mediaUtils";

import RemoteImage from "@/components/RemoteImage";
// import IconButton from "@/components/IconButton";

import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PreparedPhotoSwipeOptions } from "photoswipe";

// const GalleryCloseButton = styled(IconButton)(({ theme }) => ({
//   position: "absolute",
//   top: "0.5rem",
//   right: "0.5rem",
// }));

const fullPresentationStyles = css`
  @media (min-width: 768px) {
    padding: 0 1.5rem;
  }
`;

type ListingPhotoGalleryPresentation = "full" | "demo" | "read" | string;

const PhotosList = styled.ul<{
  $presentation?: ListingPhotoGalleryPresentation;
}>`
  display: flex;
  gap: 0.5rem;
  overflow-x: scroll;
  padding: 0 1rem;

  & li {
    flex-shrink: 0;
    border-radius: 0.25rem;
    box-shadow: 0 0 0 2px ${theme.colors.border.elevated} inset;
    overflow: hidden;
    transition:
      transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  & li:hover {
    transform: scale(0.98);
    opacity: 0.86;
  }

  ${({ $presentation }) => $presentation === "full" && fullPresentationStyles}
`;

const ListingPhotoRemoteImageThumbnail = styled(RemoteImage)`
  mix-blend-mode: multiply;
  object-fit: cover;
  background-color: ${theme.colors.background.map};
  cursor: zoom-in;
`;

const ListingPhotoRemoteImageEnlarged = styled(RemoteImage)`
  border-radius: 0.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const options: Partial<PreparedPhotoSwipeOptions> = {
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
  bgClickAction: "close" as const,
};

function ListingPhotoGallery({
  presentation,
  photos,
}: {
  presentation?: ListingPhotoGalleryPresentation;
  photos: string[];
}) {
  return (
    <PhotosList $presentation={presentation}>
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
              // Approach explained in https://github.com/dimsemenov/PhotoSwipe/issues/2105#issuecomment-2614198664
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
                <ListingPhotoRemoteImageThumbnail
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
