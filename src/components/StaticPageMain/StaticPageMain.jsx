import { styled } from "@pigment-css/react";

function StaticPageMain({ children }) {
  return <StyledMain>{children}</StyledMain>;
}

export default StaticPageMain;

// Adapted from homepage main
const StyledMain = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  // paddingTop: "10vh",
  gap: theme.spacing.gap.page.md, // Match StaticPageSection paddingTop
  // marginBottom: theme.spacing.gap.page.md, // Match gap

  // gap: theme.spacing.gap.page.sm,
  gap: "5rem",

  "@media (min-width: 768px)": {
    // paddingTop: "24vh",
    // gap: theme.spacing.gap.page.lg, // Or ~12rem
    // marginBottom: theme.spacing.gap.page.lg, // Match gap
  },
}));
