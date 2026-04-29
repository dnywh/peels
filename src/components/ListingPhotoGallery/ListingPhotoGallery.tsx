import Link from "next/link";
import { css, styled } from "next-yak";

import RemoteImage from "@/components/RemoteImage";
import { theme } from "@/styles/theme.yak";
import { buildListingPhotoHref } from "@/utils/listingPhotoRoute";

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

const ThumbnailLink = styled(Link)`
  cursor: zoom-in;
  display: block;

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
    outline-offset: 2px;
  }
`;

const ThumbnailImage = styled(RemoteImage)`
  mix-blend-mode: multiply;
  object-fit: cover;
  background-color: ${theme.colors.background.map};
  display: block;
`;

function ListingPhotoGallery({
  listingSlug,
  presentation,
  photos,
}: {
  listingSlug: string;
  presentation?: ListingPhotoGalleryPresentation;
  photos: string[];
}) {
  return (
    <PhotosList $presentation={presentation}>
      {photos.map((photo, index) => (
        <li key={photo}>
          <ThumbnailLink
            data-testid={`listing-photo-thumbnail-${index + 1}`}
            href={buildListingPhotoHref(listingSlug, photo)}
            prefetch={false}
            rel="noopener"
            target="_blank"
          >
            <ThumbnailImage
              bucket="listing_photos"
              filename={photo}
              alt={`Listing photo ${index + 1}`}
              width={280}
              height={210}
            />
          </ThumbnailLink>
        </li>
      ))}
    </PhotosList>
  );
}

export default ListingPhotoGallery;
