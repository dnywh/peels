import { prettifyLink } from "@/utils/linkUtils";
import AcceptedItemIcon from "@/components/AcceptedItemIcon";
import RejectedItemIcon from "@/components/RejectedItemIcon";
import StrongLink from "@/components/StrongLink";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

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

const sharedTypeStyles = css`
  color: ${theme.colors.text.ui.primary};
`;

type ListingItemListType = "accepted" | "rejected" | "links";

const StyledListingItemList = styled.ol<{ $type?: ListingItemListType }>`
  margin-top: 0.825rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  & li {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    container-type: inline-size;
  }

  & li a {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & li:not(:last-child) {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${theme.colors.border.base};
  }

  ${({ $type }) =>
    ($type === "accepted" || $type === "rejected" || $type === "links") &&
    sharedTypeStyles}
`;

function ListingItemList({
  items,
  type = "accepted",
}: {
  items: Array<string | ReactNode>;
  type?: ListingItemListType;
}) {
  return (
    <StyledListingItemList $type={type}>
      {items.map((item, index) => (
        <li key={index}>
          {type === "accepted" && <AcceptedItemIcon />}
          {type === "rejected" && <RejectedItemIcon />}
          {type === "links" ? (
            <StrongLink href={String(item)} target="_blank">
              {prettifyLink(String(item))}
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
