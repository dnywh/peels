import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

// Animate details & summary with a few lines of CSS
// https://www.youtube.com/watch?v=Vzj3jSUbMtI
const StyledFaqDetails = styled.details`
  &:not(:last-of-type) {
    border-bottom: 1px solid ${theme.colors.border.light};
  }
  overflow: hidden;
  &::details-content,
  &::-webkit-details-content {
    color: ${theme.colors.text.ui.secondary};
    block-size: 0;
    transition:
      block-size 200ms cubic-bezier(0.4, 0, 0.2, 1),
      content-visibility 200ms cubic-bezier(0.4, 0, 0.2, 1);
    transition-behavior: allow-discrete;
  }
  &[open]::details-content {
    block-size: auto;
  }
  & > summary:after {
    content: "+";
    line-height: 80%;
    font-size: 2rem;
    font-weight: 100;
    color: ${theme.colors.background.counter};
  }
  &[open] > summary:after {
    content: "–";
  }
  & > p {
    padding: 0 calc(${theme.spacing.unit} * 3);
    & + p {
      margin-top: 0.5rem;
    }
    &:last-of-type {
      padding-block-end: 2rem;
    }
  }
  & > summary {
    cursor: pointer;
    border-radius: ${theme.corners.base};
    transition: opacity 150ms ease-in-out;
    text-box-trim: both cap alphabetic;
    font-size: 1.2rem;
    font-weight: 500;
    color: ${theme.colors.text.ui.primary};
    padding: calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 3);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 2rem;
    &::marker,
    &::-webkit-details-marker {
      content: none;
      display: none;
    }
    &:hover {
      opacity: 0.65;
    }
  }
`;

type FaqDetailsProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<"details">, "children"> & {
    name?: string;
  }
>;

function FaqDetails({
  name = "faq", // Pass a custom name if multiple FaqContainers will be used on the same page, as name controls automatic closing of other same-named <details> elements
  children,
}: FaqDetailsProps) {
  return <StyledFaqDetails name={name}>{children}</StyledFaqDetails>;
}

export default FaqDetails;
