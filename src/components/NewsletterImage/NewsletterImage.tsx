import RemoteImage from "@/components/RemoteImage";
import NewsletterImageFigcaption from "@/components/NewsletterImageFigcaption";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
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
  return (
    <Figure $margin={margin}>
      <ThumbnailContainer>
        <StyledRemoteImage $border={border} {...props} />
      </ThumbnailContainer>
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
  box-shadow: 0 0 0 2px ${theme.colors.border.elevated} inset;
  overflow: hidden;
  border-radius: ${theme.corners.thumbnail};
`;

const StyledRemoteImage = styled(RemoteImage)<{ $border?: boolean }>`
  width: 100%;
  object-fit: cover;
  mix-blend-mode: multiply;
  background-color: ${theme.colors.background.sunk};
  border-radius: ${theme.corners.thumbnail};

  ${({ $border }) =>
    $border && `border: 1px solid ${theme.colors.border.base};`}
`;
