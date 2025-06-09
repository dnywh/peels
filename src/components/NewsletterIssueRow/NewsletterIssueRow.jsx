import Link from "next/link";
import StrongLink from "@/components/StrongLink";
import NewsletterImage from "@/components/NewsletterImage";
import { styled } from "@pigment-css/react";

const imageWidth = 192;
const imageHeight = imageWidth * 0.667;

function NewsletterIssueRow({
  featured = false,
  slug,
  title,
  issueNumber,
  date,
  previewImages,
}) {
  return (
    <ListItem key={slug}>
      <LinkedRow
        featured={featured.toString()} // Required because Link component forwards all props to the underlying DOM element
        prefetch={false}
        href={`/newsletter/${slug}`}
      >
        <Text featured={featured}>
          <h3>{title}</h3>
          <p>
            Issue #{issueNumber} · {date}
          </p>
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
              />
            ))}
          </Images>
        )}
      </LinkedRow>
    </ListItem>
  );
}

export default NewsletterIssueRow;

const ListItem = styled("li")(({ theme }) => ({
  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
  overflow: "clip",
}));

const LinkedRow = styled(Link)(({ theme }) => ({
  color: "inherit",
  padding: "2rem",
  display: "flex",
  gap: "2rem",
  // containerType: "inline-size",

  variants: [
    {
      props: { featured: "true" },
      style: {
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        "@media (min-width: 768px)": {
          padding: "3rem 2rem",
          gridTemplateColumns: "8fr 6fr",
          gridTemplateRows: "1fr",
        },
      },
    },
  ],

  transition: "opacity 150ms ease-in-out",

  "&:hover": {
    opacity: 0.5,
  },
}));

const Text = styled("div")(({ theme }) => ({
  // TODO: The children of this div aren't wrapping properly
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  "& h3": {
    fontSize: "1.5rem",
    lineHeight: "115%",
    textWrap: "balance",
    color: theme.colors.text.brand.primary,
  },

  "& p": {
    color: theme.colors.text.ui.quaternary,
    lineHeight: "115%",
  },

  variants: [
    {
      props: { featured: true },
      style: {
        "& h3": {
          fontSize: "2rem",
        },
      },
    },
  ],
}));

const Images = styled("div")(({ theme }) => ({
  // flexGrow: 1,
  // position: "relative",

  display: "flex",
  flexDirection: "row-reverse",
  // "@container (max-width: 512px)": {
  "@media (min-width: 768px)": {
    display: "unset",
  },

  "& > figure": {
    // transform: "rotate(8deg)",
    position: "relative",
    width: `${imageWidth}px`,
    // height: `${imageHeight}px`,

    // ThumbnailContainer
    "& div": {
      position: "absolute",

      // Address Next Image requirements:
      // ... has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
      // "& > img": {
      //   width: "auto",
      //   height: "auto",
      // },
    },
    // Bottom image
    "&:nth-child(1)": {
      "& div": {
        transform: "rotate(6deg)",
        top: "1rem",

        "@media (min-width: 768px)": {
          transform: "rotate(-6deg)",
          top: "1.5rem",
        },
      },
    },
    // Top image
    "&:nth-child(2)": {
      "& div": {
        // ThumbnailContainer
        transform: "rotate(-10deg)",
        top: "0.75rem",
        right: "-4rem", // Affects width, maybe due to flex behavior

        "@media (min-width: 768px)": {
          transform: "rotate(10deg)",
          top: "3rem",
          right: "-7rem",
        },
      },
    },
  },
}));
