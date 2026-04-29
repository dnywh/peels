import Link from "next/link";
import RemoteImage from "@/components/RemoteImage";
import { styled } from "next-yak";
import {
  sharedMediaFrameImageStyles,
  sharedMediaFrameStyles,
} from "@/styles/mediaFrame";

const PHOTO_THUMBNAIL_WIDTH = 360;
const PHOTO_THUMBNAIL_HEIGHT = 240;

const PhotoThumbnailContainer = styled(Link)`
  ${sharedMediaFrameStyles}
  display: block;
  position: relative;
  flex-shrink: 0;
  width: calc(${PHOTO_THUMBNAIL_WIDTH}px * 0.65);
  height: calc(${PHOTO_THUMBNAIL_HEIGHT}px * 0.65);
  @media (min-width: 768px) {
    width: ${PHOTO_THUMBNAIL_WIDTH}px;
    height: ${PHOTO_THUMBNAIL_HEIGHT}px;
  }
`;

const ListingPhotoRemoteImage = styled(RemoteImage)`
  ${sharedMediaFrameImageStyles}
  object-fit: cover;
`;

const Caption = styled.div`
  position: absolute;
  inset: 0;
  padding: 0.825rem 0.5rem;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)),
    rgba(0, 0, 0, 0.05);
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  display: flex;
  align-items: flex-end;
  ${PhotoThumbnailContainer}:hover & {
    opacity: 1;
  }
  & > p {
    text-align: left;
    text-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5);
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 115%;
  }
`;

function PhotoThumbnail({
  fileName,
  listingId,
  caption,
  testId,
}: {
  fileName: string;
  listingId: string;
  caption?: string;
  testId?: string;
}) {
  return (
    <li>
      <PhotoThumbnailContainer
        href={`/map?listing=${listingId}`}
        data-testid={testId}
      >
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
