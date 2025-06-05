import { styled } from "@pigment-css/react";

function StaticPageSection({ size = null, children, ...props }) {
  return (
    <Section size={size} {...props}>
      {children}
    </Section>
  );
}

export default StaticPageSection;

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.55rem",
  maxWidth: "720px",
  width: "100%",

  paddingTop: theme.spacing.gap.page.md, // Match page gap in StaticPageMain
  borderTop: `1px solid ${theme.colors.border.light}`,

  "@media (min-width: 768px)": {
    // paddingTop: theme.spacing.gap.page.lg, // Match page gap StaticPageMain
    // gap: theme.spacing.gap.section,
  },

  variants: [
    {
      props: { size: "large" }, // Homepage use
      style: {
        // Match homepage rhythm
        paddingTop: theme.spacing.gap.page.md,
        "@media (min-width: 768px)": {
          paddingTop: theme.spacing.gap.page.lg,
        },
      },
    },
  ],
}));
