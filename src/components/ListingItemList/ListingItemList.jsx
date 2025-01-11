import AcceptedItemIcon from "@/components/AcceptedItemIcon";
import RejectedItemIcon from "@/components/RejectedItemIcon";
import Link from "next/link";
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
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  "& li": {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },

  "& li:not(:last-child)": {
    paddingBottom: "0.5rem",
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
            <Link href={item} target="_blank">
              {item}
            </Link>
          ) : (
            item
          )}
        </li>
      ))}
    </StyledListingItemList>
  );
}

export default ListingItemList;
