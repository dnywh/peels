import { prettifyLink } from "@/utils/linkUtils";
import AcceptedItemIcon from "@/components/AcceptedItemIcon";
import RejectedItemIcon from "@/components/RejectedItemIcon";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";

// TODO:  Use ::marker method with SVG inline, once Data URI is supported in Pigment
// https://www.svgbackgrounds.com/custom-css-bullets-with-marker/
// FROM
// "& li::marker": {
//           content: '"❌"',
//         },
// TO
// "& li::marker": {
//   content: `"url('data:image/svg+xml,${AcceptedItemIconSVG})"`,
// },
// Note the tricky bracket arrangement around the content
// Perhaps via encodeURIComponent?

const StyledListingItemList = styled("ol")(({ theme }) => ({
  marginTop: "0.825rem", // Optical offset from heading
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",

  "& li": {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    containerType: "inline-size", // Needed to stop <a> text from making this container grow

    "& a": {
      // Clip text if necessary
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      // maxWidth: "40ch",
    },
  },

  "& li:not(:last-child)": {
    paddingBottom: "0.75rem",
    borderBottom: `1px solid ${theme.colors.border.base}`,
  },
  variants: [
    {
      props: { type: "accepted" },
      style: {
        color: theme.colors.text.base,
      },
    },
    {
      props: { type: "rejected" },
      style: {
        color: theme.colors.text.base,
      },
    },
    {
      props: { type: "links" },
      style: {
        color: theme.colors.text.base,
      },
    },
  ],
}));

function ListingItemList({ items, type = "accepted" }) {
  return (
    <StyledListingItemList type={type}>
      {items.map((item, index) => (
        <li key={index}>
          {type === "accepted" && <AcceptedItemIcon />}
          {type === "rejected" && <RejectedItemIcon />}
          {type === "links" ? (
            <StrongLink href={item} target="_blank">
              {prettifyLink(item)}
            </StrongLink>
          ) : (
            item
          )}
        </li>
      ))}
    </StyledListingItemList>
  );
}

export default ListingItemList;
