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

const zoomCursor =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E%3Ccircle cx=%2710%27 cy=%2710%27 r=%276.25%27 fill=%27white%27 fill-opacity=%270.92%27 stroke=%27%231f1f1f%27 stroke-width=%271.5%27/%3E%3Cpath d=%27M14.75 14.75 20 20%27 stroke=%27%231f1f1f%27 stroke-width=%272%27 stroke-linecap=%27round%27/%3E%3Cpath d=%27M10 7.25v5.5M7.25 10h5.5%27 stroke=%27%231f1f1f%27 stroke-width=%271.5%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") 10 10, zoom-in';

type ListingPhotoGalleryPresentation = "full" | "demo" | "read" | string;

const PhotosList = styled.ul<{
  $presentation?: ListingPhotoGalleryPresentation;
}>`
  display: flex;
  gap: 0.5rem;
  overflow-x: scroll;
  padding: 0 1rem;

  & li {
    cursor: ${zoomCursor};
    flex-shrink: 0;
    border-radius: 0.25rem;
    background-color: ${theme.colors.background.sunk};
    border: 3px solid ${theme.colors.border.elevated};
    overflow: hidden;
    transition:
      transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  & li:hover {
    transform: scale(0.98);
    opacity: 0.86;
  }

  & li * {
    cursor: ${zoomCursor};
  }

  ${({ $presentation }) => $presentation === "full" && fullPresentationStyles}
`;

const ThumbnailLink = styled(Link)`
  cursor: ${zoomCursor};
  display: block;

  &,
  & * {
    cursor: ${zoomCursor};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
    outline-offset: 2px;
  }
`;

const ThumbnailImage = styled(RemoteImage)`
  object-fit: cover;
  background-color: ${theme.colors.background.sunk};
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
