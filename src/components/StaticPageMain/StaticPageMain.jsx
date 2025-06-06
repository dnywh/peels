import { styled } from "@pigment-css/react";

function StaticPageMain({ padding = null, children }) {
  return <StyledMain padding={padding}>{children}</StyledMain>;
}

export default StaticPageMain;

// Adapted from homepage main
const StyledMain = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  //  Match rhythm in defined in StaticPageSection
  gap: theme.spacing.gap.page.md,
  "@media (min-width: 768px)": {
    gap: theme.spacing.gap.page.md,
  },

  variants: [
    {
      props: { padding: "wide" },
      style: {
        //  Match rhythm in defined in StaticPageSection
        paddingTop: theme.spacing.gap.page.md,
        "@media (min-width: 768px)": {
          paddingTop: theme.spacing.gap.page.lg,
        },
      },
    },
  ],
}));
