import { siteConfig } from "@/config/site";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageSection from "@/components/StaticPageSection";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import HeaderBlock from "@/components/HeaderBlock";

export const metadata = {
  title: "Support",
  description: "Answers to common questions about Peels.",
  openGraph: {
    title: `Support · ${siteConfig.name}`,
    description: "Answers to common questions about Peels.",
  }
};

export default function Support() {
  return (
    <StaticPageMain>
      <StaticPageHeader
        title="Support"
        subtitle={
          <>
            We periodically update this page with answers to common questions.
            Feel free to{" "}
            <EncodedEmailLink as="plain" address={siteConfig.email.support}>
              email us
            </EncodedEmailLink>{" "}
            for help with anything else.
          </>
        }
      />

      <StaticPageSection padding={null}>
        <HeaderBlock>
          <h2>Using Peels</h2>
        </HeaderBlock>
        <SupportFaq />
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>About Peels</h2>
        </HeaderBlock>
        <PeelsFaq />
      </StaticPageSection>
    </StaticPageMain>
  );
}
