import Link from "next/link";
import StrongLink from "@/components/StrongLink";
import NewsletterImage from "@/components/NewsletterImage";
import { styled } from "@pigment-css/react";

function NewsletterIssueRow({
  featured,
  slug,
  title,
  issueNumber,
  date,
  featuredImages,
}) {
  return (
    <ListItem key={slug}>
      <LinkedRow prefetch={false} href={`/newsletter/${slug}`}>
        {/* {featured && "Featured because I'm the most recent item!"} */}
        <Text>
          <h3>{title}</h3>
          <p>
            Issue #{issueNumber} · {date}
          </p>
        </Text>
        {/* TODO: ignore if featured === false */}
        {featuredImages && (
          <Images>
            {featuredImages.map((image) => (
              <NewsletterImage
                key={image}
                bucket={`static/newsletter/${issueNumber}`}
                filename={image}
                alt="A preview image from this newsletter issue"
                width={256}
                height={256}
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
  flexDirection: "column",
  gap: "3rem",

  "@media (min-width: 768px)": {
    flexDirection: "row",
    gap: "1.5rem",
  },

  transition: "opacity 150ms ease-in-out, transform 150ms ease-in-out",

  "&:hover": {
    opacity: 0.5,
    // transform: "scale(0.99875)",
  },
}));

const Text = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  "@media (min-width: 768px)": {
    flex: 2, // Leave some room for image(s)
  },
}));

const Images = styled("div")(({ theme }) => ({
  flex: 1,
  // position: "absolute",
  // bottom: 0,
  // right: "2rem",

  position: "relative",
  // position

  "& > figure": {
    // opacity: 0.5,
    position: "absolute",
    right: 0,
    width: 128,
    height: 128,
    transform: "rotate(8deg)",
  },
}));
