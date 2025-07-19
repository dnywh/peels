import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageSection from "@/components/StaticPageSection";

import EmailSelector from "@/components/EmailSelector/EmailSelector";

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
      <StaticPageHeader title={t("title")} subtitle={t("subtitle")} />

      <StaticPageSection padding={null}>
        <EmailSelector />
      </StaticPageSection>
    </StaticPageMain>
  );
}
