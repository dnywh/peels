import { styled } from "@pigment-css/react";

interface StaticPageSectionProps {
  padding?: "md" | "lg" | null;
  children?: React.ReactNode;
}

function StaticPageSection({
  padding = "md",
  children,
  ...props
}: StaticPageSectionProps) {
  return (
    <Section padding={padding ?? ""} {...props}>
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
    // {
    //   props: { padding: "" }, // When {null} is passed. Top-of-page use, like in Newsletter or Support
    // },
    {
      props: { padding: "md" }, // Standard static page use with a small gap
      style: {
        paddingTop: theme.spacing.gap.page.md, // Match page gap in StaticPageMain
        borderTop: `1px solid ${theme.colors.border.light}`,
      },
    },
    {
      props: { padding: "lg" }, // Homepage use
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
