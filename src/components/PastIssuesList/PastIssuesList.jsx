// Must be defined here for same reasons as described in StyledList
import { styled } from "@pigment-css/react";

export default function PastIssuesList({ children }) {
  return <StyledList>{children}</StyledList>;
}

const StyledList = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1rem",

  "@media (min-width: 768px)": {
    gridTemplateColumns: "1fr 1fr",
  },
}));
