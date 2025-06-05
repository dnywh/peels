import StaticPageHeader from "@/components/StaticPageHeader";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import { siteConfig } from "@/config/site";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import { styled } from "@pigment-css/react";
import StaticPageMain from "@/components/StaticPageMain";

export const metadata = {
  title: "Support",
  description: "Answers to common questions on, and about, Peels."
};

export default function Support() {
  return (
    <StaticPageMain>
      {/* <div> */}
      <StaticPageHeader
        title="Support"
        subtitle={
          <>
            We periodically update this page with answers to common questions.
            Feel free to{" "}
            <EncodedEmailHyperlink address={siteConfig.email.support}>
              email us
            </EncodedEmailHyperlink>{" "}
            for help with anything else.
          </>
        }
      />

      <Content>
        <Section>
          <h2>Using Peels</h2>
          <SupportFaq />
        </Section>

        <Section>
          <h2>About Peels</h2>
          <PeelsFaq />
        </Section>
      </Content>
      {/* </div> */}
    </StaticPageMain>
  );
}

const Content = styled("div")(({ theme }) => ({
  margin: "0 auto",
  maxWidth: theme.spacing.container.text.maxWidth,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.gap.page.sm,

  "@media (min-width: 768px)": {
    gap: theme.spacing.gap.page.md,
  },
}))

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.gap.sectionInner,
}))
