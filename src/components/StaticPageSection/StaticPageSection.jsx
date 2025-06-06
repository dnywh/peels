import { styled } from "@pigment-css/react";

function StaticPageSection({ padding = "normal", children, ...props }) {
  return (
    <Section padding={padding} {...props}>
      {children}
    </Section>
  );
}

export default StaticPageSection;

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing.gap.section.md,
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.media,

  variants: [
    // props: { padding: null }     // top-of-page use, like in Newsletter or Support
    {
      props: { padding: "normal" }, // Standard static page use with a small gap
      style: {
        paddingTop: theme.spacing.gap.page.md, // Match page gap in StaticPageMain
        borderTop: `1px solid ${theme.colors.border.light}`,
      },
    },
    {
      props: { padding: "wide" }, // Homepage use
      style: {
        // Match homepage rhythm
        gap: theme.spacing.gap.section.lg,
        paddingTop: theme.spacing.gap.page.md,
        "@media (min-width: 768px)": {
          paddingTop: theme.spacing.gap.page.lg,
        },
      },
    },
  ],
}));
