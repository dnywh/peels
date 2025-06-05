import Hyperlink from "@/components/Hyperlink";
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
    <Row key={slug}>
      {featured && "Most recent item!"}
      <h3>
        <Hyperlink prefetch={false} href={`/newsletter/${slug}`}>
          {`${title}`}
        </Hyperlink>
      </h3>
      <p>
        Issue #{issueNumber} · {date}
      </p>
      {/* TODO: ignore if featured === false */}
      {featuredImages &&
        featuredImages.map((image) => (
          <NewsletterImage
            key={image}
            bucket={`static/newsletter/${issueNumber}`}
            filename={image}
            alt="A map showing all the Peels host pins around the world"
            width={944}
            height={232}
            caption="A world map of Peels hosts, including far-flung places like Portugal, Hawaii, Alaska, Peru, Hungary, and Argentina."
          />
        ))}
    </Row>
  );
}

export default NewsletterIssueRow;

const Row = styled("li")(({ theme }) => ({
  backgroundColor: theme.colors.background.top,
  padding: "2rem 2rem 3.5rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
}));
