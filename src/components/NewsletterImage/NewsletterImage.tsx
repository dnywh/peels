import RemoteImage from "@/components/RemoteImage";
import NewsletterImageFigcaption from "@/components/NewsletterImageFigcaption";
import { css, styled } from "next-yak";
import {
  sharedMediaFrameBorderStyles,
  sharedMediaFrameImageStyles,
  sharedMediaFrameShapeStyles,
} from "@/styles/mediaFrame";
import type { ReactNode } from "react";
import type { RemoteImageProps } from "@/components/RemoteImage/RemoteImage";

type NewsletterImageProps = RemoteImageProps & {
  caption?: ReactNode;
  margin?: boolean;
  border?: boolean;
};

function NewsletterImage({
  caption,
  margin = true,
  border = true,
  ...props
}: NewsletterImageProps) {
  const Frame = border ? BorderedThumbnailContainer : ThumbnailContainer;

  return (
    <Figure $margin={margin}>
      <Frame>
        <StyledRemoteImage {...props} />
      </Frame>
      {caption && (
        <NewsletterImageFigcaption>{caption}</NewsletterImageFigcaption>
      )}
    </Figure>
  );
}

export default NewsletterImage;

const withMarginStyles = css`
  margin: 2rem 0;
`;

const Figure = styled.figure<{ $margin?: boolean }>`
  ${({ $margin }) => $margin && withMarginStyles}
`;

const ThumbnailContainer = styled.div`
  ${sharedMediaFrameShapeStyles}
`;

const BorderedThumbnailContainer = styled(ThumbnailContainer)`
  ${sharedMediaFrameBorderStyles}
`;

const StyledRemoteImage = styled(RemoteImage)`
  ${sharedMediaFrameImageStyles}
  width: 100%;
  object-fit: cover;
`;
