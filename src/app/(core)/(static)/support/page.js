import StaticPageHeader from "@/components/StaticPageHeader";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import { siteConfig } from "@/config/site";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import { styled } from "@pigment-css/react";

export const metadata = {
  title: "Support",
  description: "Answers to common questions on, and about, Peels."
};

export default function Support() {
  return (
    <>
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
      <h2>Using Peels</h2>
      <SupportFaq />

      <h2>About Peels</h2>
      <PeelsFaq />
    </>
  );
}
