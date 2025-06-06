import StaticPageHeader from "@/components/StaticPageHeader";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import { siteConfig } from "@/config/site";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageSection from "@/components/StaticPageSection";
import HeaderBlock from "@/components/HeaderBlock";
import { styled } from "@pigment-css/react";

export const metadata = {
  title: "Support",
  description: "Answers to common questions about Peels."
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
