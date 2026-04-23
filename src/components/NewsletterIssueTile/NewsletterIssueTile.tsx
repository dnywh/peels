import Link from "next/link";
import StrongLink from "@/components/StrongLink";
import NewsletterImage from "@/components/NewsletterImage";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const imageWidth = 192;
const imageHeight = imageWidth * 0.667;

interface NewsletterIssueTileProps {
  featured?: boolean;
  slug: string;
  title: string;
  issueNumber: number;
  subtitle: string;
  previewImages?: string[];
}

export default function NewsletterIssueTile({
  featured = false,
  slug,
  title,
  issueNumber,
  subtitle,
  previewImages,
}: NewsletterIssueTileProps) {
  return (
    <ListItem key={slug}>
      <LinkedRow
        $featured={featured}
        prefetch={false}
        href={`/newsletter/${slug}`}
      >
        <Text $featured={featured}>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </Text>
        {featured && (
          <Images>
            {previewImages?.map((image) => (
              <NewsletterImage
                key={image}
                bucket={`static/newsletter/${issueNumber}`}
                filename={image}
                alt={`An image from issue ${issueNumber}`}
                width={imageWidth}
                height={imageHeight}
                border={false}
                margin={false}
                caption={undefined}
              />
            ))}
          </Images>
        )}
      </LinkedRow>
    </ListItem>
  );
}

const featuredRowStyles = css`
  display: grid;
  grid-template-rows: 1fr 1fr;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
    grid-template-columns: 8fr 6fr;
    grid-template-rows: 1fr;
  }
`;

const featuredTextStyles = css`
  & h3 {
    font-size: 1.75rem;
  }
`;

const ListItem = styled.li`
  background-color: ${theme.colors.background.top};
  border-radius: ${theme.corners.base};
  border: 1px solid ${theme.colors.border.base};
  overflow: clip;
`;

const LinkedRow = styled(Link)<{ $featured?: boolean }>`
  color: inherit;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  transition: opacity 150ms ease-in-out;

  &:hover {
    opacity: 0.5;
  }

  ${({ $featured }) => $featured && featuredRowStyles}
`;

const Text = styled.div<{ $featured?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  & h3 {
    font-size: 1.5rem;
    line-height: 115%;
    text-wrap: balance;
    color: ${theme.colors.text.brand.primary};
  }

  & p {
    color: ${theme.colors.text.ui.quaternary};
    line-height: 115%;
  }

  ${({ $featured }) => $featured && featuredTextStyles}
`;

const Images = styled.div`
  display: flex;
  flex-direction: row-reverse;

  @media (min-width: 768px) {
    display: unset;
  }

  & > figure {
    position: relative;
    width: ${imageWidth}px;
  }

  & > figure div {
    position: absolute;
  }

  & > figure:nth-child(1) div {
    transform: rotate(6deg);
    top: 1rem;

    @media (min-width: 768px) {
      transform: rotate(-6deg);
      top: 1.5rem;
    }
  }

  & > figure:nth-child(2) div {
    transform: rotate(-10deg);
    top: 0.75rem;
    right: -4rem;

    @media (min-width: 768px) {
      transform: rotate(10deg);
      top: 3rem;
      right: -7rem;
    }
  }
`;
