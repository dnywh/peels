import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageSection from "@/components/StaticPageSection";
import EmailSelector from "@/components/EmailSelector/EmailSelector";
import { styled } from "@pigment-css/react";

export const metadata = {
  title: "Contact",
  description: "Here’s how to reach the Peels team.",
  openGraph: {
    title: `Contact · ${siteConfig.name}`,
    description: "Here’s how to reach the Peels team.",
  },
};

export default function Contact() {
  const t = useTranslations("Contact");

  return (
    <StaticPageMain>
      {/* Nest header and main content together so they visually hug */}
      <HuggingContent>
        <StaticPageHeader title={t("title")} subtitle={t("subtitle")} />
        <EmailSelector />
      </HuggingContent>
    </StaticPageMain>
  );
}

const HuggingContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing.gap.section.md,
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.media,
}));
