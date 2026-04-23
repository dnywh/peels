// Must be defined here for same reasons as described in StyledList
import { styled } from "next-yak";
import type { PropsWithChildren } from "react";

export default function PastIssuesList({ children }: PropsWithChildren) {
  return <StyledList>{children}</StyledList>;
}

const StyledList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;
